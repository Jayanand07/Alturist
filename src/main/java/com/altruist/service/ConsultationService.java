package com.altruist.service;

import com.altruist.dto.CompleteConsultationRequestDTO;
import com.altruist.dto.ConsultationResponseDTO;
import com.altruist.dto.InstantBookingRequestDTO;
import com.altruist.dto.RoomJoinResponseDTO;
import com.altruist.exception.ConsultationNotFoundException;
import com.altruist.exception.DoctorNotAvailableException;
import com.altruist.exception.DoctorNotFoundException;
import com.altruist.exception.UnauthorizedConsultationAccessException;
import com.altruist.model.*;
import com.altruist.repository.ConsultationRepository;
import com.altruist.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private static final Logger logger = LoggerFactory.getLogger(ConsultationService.class);
    private static final String JITSI_DOMAIN = "meet.jit.si";
    private static final String JITSI_BASE_URL = "https://" + JITSI_DOMAIN + "/";

    private final ConsultationRepository consultationRepository;
    private final DoctorRepository doctorRepository;

    // ── Booking ─────────────────────────────────────────────────────────────

    /**
     * Books an instant consultation.
     *
     * CRITICAL: This method atomically:
     * 1. Validates the doctor exists and is available
     * 2. Sets doctor.isAvailable = false (prevents double-booking)
     * 3. Creates the Consultation entity with a deterministic Jitsi room name
     */
    @Transactional
    public ConsultationResponseDTO bookInstantConsultation(User patient, InstantBookingRequestDTO request) {
        Doctor doctor = doctorRepository.findByIdWithUser(request.getDoctorId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        if (!Boolean.TRUE.equals(doctor.getIsAvailable())) {
            throw new DoctorNotAvailableException(doctor.getUser().getFullName());
        }

        // Mark doctor unavailable BEFORE creating consultation
        doctor.setIsAvailable(false);
        doctorRepository.save(doctor);

        // Create consultation
        Consultation consultation = new Consultation();
        consultation.setPatient(patient);
        consultation.setDoctor(doctor);
        consultation.setScheduledAt(LocalDateTime.now());
        consultation.setConsultationType(ConsultationType.INSTANT);
        consultation.setStatus(ConsultationStatus.PENDING);
        consultation.setAmount(doctor.getConsultationFee());
        consultation.setPaymentStatus(PaymentStatus.PENDING);
        consultation.setChiefComplaint(request.getChiefComplaint());

        // Save to generate UUID, then set deterministic room name
        Consultation saved = consultationRepository.save(consultation);
        saved.setVideoRoomId(generateVideoRoomName(saved.getId()));
        saved = consultationRepository.save(saved);

        logger.info("Consultation booked: {} | Patient: {} → Doctor: {}",
                saved.getId(), patient.getFullName(), doctor.getUser().getFullName());

        return toResponseDTO(saved);
    }

    // ── Room Join ───────────────────────────────────────────────────────────

    /**
     * Handles a user joining the video room.
     *
     * 1. Verifies the user is the patient or doctor of this consultation
     * 2. Checks the consultation is in a joinable state (PENDING or ONGOING)
     * 3. Generates the room name if it doesn't exist yet
     * 4. Marks the call as started (sets callStartedAt, status → ONGOING) on first join
     * 5. Returns room details for the Jitsi iframe
     */
    @Transactional
    public RoomJoinResponseDTO joinRoom(User authenticatedUser, UUID consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ConsultationNotFoundException(consultationId));

        UUID userId = authenticatedUser.getId();
        boolean isPatient = consultation.getPatient().getId().equals(userId);
        boolean isDoctor = consultation.getDoctor().getUser().getId().equals(userId);

        if (!isPatient && !isDoctor) {
            throw new UnauthorizedConsultationAccessException();
        }

        // Only PENDING or ONGOING consultations can be joined
        ConsultationStatus status = consultation.getStatus();
        if (status != ConsultationStatus.PENDING && status != ConsultationStatus.ONGOING) {
            throw new IllegalStateException("This consultation cannot be joined in its current state");
        }

        // Generate room name if missing (safety net — booking should have set it)
        if (consultation.getVideoRoomId() == null || consultation.getVideoRoomId().isBlank()) {
            consultation.setVideoRoomId(generateVideoRoomName(consultationId));
        }

        // Transition PENDING → ONGOING on first join, record call start time
        if (status == ConsultationStatus.PENDING) {
            consultation.setStatus(ConsultationStatus.ONGOING);
            consultation.setCallStartedAt(LocalDateTime.now());
            logger.info("Consultation {} is now ONGOING", consultationId);
        }

        consultationRepository.save(consultation);

        // Determine role and display name
        String userRole = isDoctor ? "doctor" : "patient";
        String displayName = authenticatedUser.getFullName();

        return RoomJoinResponseDTO.builder()
                .roomName(consultation.getVideoRoomId())
                .displayName(displayName)
                .userRole(userRole)
                .jitsiDomain(JITSI_DOMAIN)
                .consultationStatus(consultation.getStatus().name())
                .build();
    }

    // ── Complete ────────────────────────────────────────────────────────────

    /**
     * Completes a consultation (called by the doctor).
     *
     * Atomically:
     * 1. Validates the consultation exists and belongs to the calling doctor
     * 2. Stores diagnosis and prescription data
     * 3. Records call end time and duration
     * 4. Marks consultation as COMPLETED
     * 5. Increments doctor.totalConsultations
     * 6. Sets doctor.isAvailable = true (reopens for new bookings)
     */
    @Transactional
    public ConsultationResponseDTO completeConsultation(User doctorUser, UUID consultationId, CompleteConsultationRequestDTO request) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ConsultationNotFoundException(consultationId));

        // Verify the calling doctor owns this consultation
        Doctor doctor = consultation.getDoctor();
        if (!doctor.getUser().getId().equals(doctorUser.getId())) {
            throw new UnauthorizedConsultationAccessException("You are not the assigned doctor for this consultation");
        }

        // Store diagnosis and prescription data
        String fullDiagnosis = request.getDiagnosis();
        if (request.getPrescriptionData() != null && !request.getPrescriptionData().isBlank()) {
            fullDiagnosis += "\n\n--- PRESCRIPTION DATA (JSON) ---\n" + request.getPrescriptionData();
        }
        consultation.setDiagnosis(fullDiagnosis);

        // Record call end time and duration
        consultation.setCallEndedAt(LocalDateTime.now());
        if (request.getCallDurationMinutes() != null) {
            consultation.setCallDurationMinutes(request.getCallDurationMinutes());
        }

        // Update consultation status
        consultation.setStatus(ConsultationStatus.COMPLETED);

        // Increment doctor stats and re-enable availability
        doctor.setTotalConsultations(doctor.getTotalConsultations() + 1);
        doctor.setIsAvailable(true);
        doctorRepository.save(doctor);

        Consultation saved = consultationRepository.save(consultation);
        logger.info("Consultation completed: {} | Doctor: {} | Duration: {} min",
                saved.getId(), doctor.getUser().getFullName(), request.getCallDurationMinutes());

        return toResponseDTO(saved);
    }

    // ── Read ────────────────────────────────────────────────────────────────

    /**
     * Fetches consultation details. Only the patient or doctor of this
     * specific consultation is allowed to view it.
     */
    @Transactional(readOnly = true)
    public ConsultationResponseDTO getConsultationById(User authenticatedUser, UUID consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ConsultationNotFoundException(consultationId));

        UUID userId = authenticatedUser.getId();
        boolean isPatient = consultation.getPatient().getId().equals(userId);
        boolean isDoctor = consultation.getDoctor().getUser().getId().equals(userId);

        if (!isPatient && !isDoctor) {
            throw new UnauthorizedConsultationAccessException();
        }

        return toResponseDTO(consultation);
    }

    // ── Patient Booking & Dash ─────────────────────────────────────────────

    @Transactional
    public void cancelConsultation(User patient, UUID consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ConsultationNotFoundException(consultationId));

        if (!consultation.getPatient().getId().equals(patient.getId())) {
            throw new UnauthorizedConsultationAccessException("You can only cancel your own consultations.");
        }

        if (consultation.getStatus() == ConsultationStatus.ONGOING) {
            throw new IllegalStateException("Cannot cancel a consultation that is currently in progress.");
        }

        // Informational: 2 hr check warning handled frontend side. 
        // We just execute the cancellation here.
        ConsultationStatus oldStatus = consultation.getStatus();
        consultation.setStatus(ConsultationStatus.CANCELLED);
        
        // If it was PENDING instantly, free the doctor
        if (oldStatus == ConsultationStatus.PENDING && consultation.getDoctor() != null) {
            Doctor doctor = consultation.getDoctor();
            doctor.setIsAvailable(true);
            doctorRepository.save(doctor);
        }

        consultationRepository.save(consultation);
    }

    @Transactional
    public ConsultationResponseDTO requestReschedule(User patient, UUID consultationId, com.altruist.dto.RescheduleRequestDTO request) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ConsultationNotFoundException(consultationId));

        if (!consultation.getPatient().getId().equals(patient.getId())) {
            throw new UnauthorizedConsultationAccessException();
        }

        if (consultation.getStatus() == ConsultationStatus.ONGOING || consultation.getStatus() == ConsultationStatus.COMPLETED) {
            throw new IllegalStateException("Cannot reschedule a consultation in its current state.");
        }

        // Parse local date + time string into LocalDateTime
        try {
            java.time.LocalTime time = java.time.LocalTime.parse(request.getPreferredTime());
            LocalDateTime proposed = request.getPreferredDate().atTime(time);
            
            consultation.setIsRescheduleRequested(true);
            consultation.setProposedRescheduleTime(proposed);
            consultation.setRescheduleReason(request.getReason());
            
            Consultation saved = consultationRepository.save(consultation);
            return toResponseDTO(saved);
        } catch (Exception e) {
            throw new IllegalStateException("Invalid date or time format for reschedule.");
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<ConsultationResponseDTO> getMyConsultations(User patient) {
        return consultationRepository.findByPatientIdOrderByScheduledAtDesc(patient.getId())
                .stream().map(this::toResponseDTO).toList();
    }

    // ── Doctor Reschedule Management ────────────────────────────────────────

    @Transactional(readOnly = true)
    public java.util.List<ConsultationResponseDTO> getDoctorRescheduleRequests(User doctorUser) {
        Doctor doctor = doctorRepository.findByUserId(doctorUser.getId())
                .orElseThrow(() -> new DoctorNotFoundException(doctorUser.getId()));

        return consultationRepository.findByDoctorIdAndIsRescheduleRequestedTrue(doctor.getId())
                .stream().map(this::toResponseDTO).toList();
    }

    @Transactional
    public ConsultationResponseDTO approveReschedule(User doctorUser, UUID consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ConsultationNotFoundException(consultationId));

        if (!consultation.getDoctor().getUser().getId().equals(doctorUser.getId())) {
            throw new UnauthorizedConsultationAccessException("Not assigned to this consultation.");
        }

        consultation.setScheduledAt(consultation.getProposedRescheduleTime());
        consultation.setIsRescheduleRequested(false);
        consultation.setProposedRescheduleTime(null);
        consultation.setRescheduleReason(null);
        
        return toResponseDTO(consultationRepository.save(consultation));
    }

    @Transactional
    public ConsultationResponseDTO declineReschedule(User doctorUser, UUID consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ConsultationNotFoundException(consultationId));

        if (!consultation.getDoctor().getUser().getId().equals(doctorUser.getId())) {
            throw new UnauthorizedConsultationAccessException();
        }

        consultation.setIsRescheduleRequested(false);
        consultation.setProposedRescheduleTime(null);
        consultation.setRescheduleReason(null);
        
        return toResponseDTO(consultationRepository.save(consultation));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Generates a unique, hard-to-guess Jitsi room name.
     * Format: "consultation-{uuid}-{randomToken}"
     */
    private String generateVideoRoomName(UUID consultationId) {
        String randomToken = UUID.randomUUID().toString().substring(0, 8);
        return "consultation-" + consultationId + "-" + randomToken;
    }

    private ConsultationResponseDTO toResponseDTO(Consultation consultation) {
        Doctor doctor = consultation.getDoctor();
        User doctorUser = doctor.getUser();
        String videoRoomId = consultation.getVideoRoomId();

        return ConsultationResponseDTO.builder()
                .consultationId(consultation.getId())
                .videoRoomId(videoRoomId)
                .videoRoomUrl(videoRoomId != null ? JITSI_BASE_URL + videoRoomId : null)
                .patientId(consultation.getPatient().getId())
                .doctorId(doctorUser != null ? doctorUser.getId() : null)
                .doctorName(doctorUser != null ? doctorUser.getFullName() : null)
                .doctorSpecialization(doctor.getSpecialization())
                .patientName(consultation.getPatient() != null ? consultation.getPatient().getFullName() : null)
                .scheduledAt(consultation.getScheduledAt())
                .amount(consultation.getAmount())
                .status(consultation.getStatus().name())
                .type(consultation.getConsultationType().name())
                .diagnosis(consultation.getDiagnosis())
                .prescriptionUrl(consultation.getPrescriptionUrl())
                .doctorProfilePictureUrl(doctorUser != null ? doctorUser.getProfilePictureUrl() : null)
                .isRescheduleRequested(consultation.getIsRescheduleRequested())
                .proposedRescheduleTime(consultation.getProposedRescheduleTime())
                .rescheduleReason(consultation.getRescheduleReason())
                .build();
    }
}
