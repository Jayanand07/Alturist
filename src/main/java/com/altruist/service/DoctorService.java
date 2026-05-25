package com.altruist.service;

import com.altruist.dto.*;
import com.altruist.exception.DoctorNotFoundException;
import com.altruist.model.*;
import com.altruist.repository.ConsultationRepository;
import com.altruist.repository.DoctorRepository;
import com.altruist.repository.PrescriptionRepository;
import com.altruist.repository.UserRepository;
import com.altruist.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.altruist.repository.ConsultationRatingRepository;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final ConsultationRepository consultationRepository;
    private final ConsultationRatingRepository ratingRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Fetches dashboard data specifically for the logged-in doctor.
     * Uses optimized native SQL queries for statistics.
     */
    @Transactional(readOnly = true)
    public DoctorDashboardDTO getDashboardData(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("No doctor profile found for this user"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.with(LocalTime.MIN);
        LocalDateTime todayEnd = now.with(LocalTime.MAX);
        LocalDateTime monthStart = now.withDayOfMonth(1).with(LocalTime.MIN);

        // 1. Optimized Stats via Native SQL
        Long todaysConsultations = consultationRepository.countTodaysConsultations(doctor.getId(), todayStart, todayEnd);
        BigDecimal monthlyEarnings = consultationRepository.calculateMonthlyEarnings(doctor.getId(), monthStart);
        Double averageRating = ratingRepository.getAverageRatingByDoctorId(doctor.getId());
        Long totalPatients = consultationRepository.countTotalUniquePatients(doctor.getId());
        // IMPORTANT: Repository must use COUNT(DISTINCT patient_id) not COUNT(*)

        // 2. Schedule and queues (Using EntityGraph via JPA for relations)
        List<Consultation> todaysConsultationsList = consultationRepository.findByDoctorIdAndScheduledAtBetweenOrderByScheduledAtAsc(
                doctor.getId(), todayStart, todayEnd);

        List<Consultation> instantQueueList = consultationRepository.findPendingInstantQueue(doctor.getId());

        List<Consultation> recentList = consultationRepository.findByDoctorIdAndStatus(doctor.getId(), ConsultationStatus.COMPLETED);
        // Take last 5 recent
        List<Consultation> recentLimited = recentList.stream()
                .sorted((c1, c2) -> c2.getScheduledAt().compareTo(c1.getScheduledAt()))
                .limit(5)
                .collect(Collectors.toList());

        return DoctorDashboardDTO.builder()
                .doctorName("Dr. " + doctor.getUser().getFullName())
                .isAvailable(doctor.getIsAvailable())
                .stats(DoctorDashboardDTO.Stats.builder()
                        .todaysConsultations(todaysConsultations)
                        .monthlyEarnings(monthlyEarnings)
                        .averageRating(averageRating != null ? averageRating : 5.0)
                        .totalPatientsTreated(totalPatients.intValue())
                        .build())
                .todaysSchedule(todaysConsultationsList.stream().map(this::toItemDTO).collect(Collectors.toList()))
                .pendingInstantConsultations(instantQueueList.stream().map(this::toItemDTO).collect(Collectors.toList()))
                .recentConsultations(recentLimited.stream().map(this::toItemDTO).collect(Collectors.toList()))
                .build();
    }

    /**
     * Returns the global and doctor-specific pending instant consultation queue.
     */
    @Transactional(readOnly = true)
    public List<DoctorDashboardDTO.ConsultationItemDTO> getInstantQueue(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("No doctor profile found for this user"));
        
        return consultationRepository.findPendingInstantQueue(doctor.getId()).stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * Atomically accepts an instant consultation.
     */
    @Transactional
    public Map<String, UUID> acceptInstantConsultation(UUID userId, UUID consultationId) {
        User callingUser = userRepository.findByFirebaseUid(SecurityContextHolder.getContext().getAuthentication().getName())
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!callingUser.getUserType().equals(UserType.DOCTOR)) {
            throw new UnauthorizedException("Only doctors can accept consultations");
        }

        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("No doctor profile found for this user"));

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));

        if (consultation.getStatus() != ConsultationStatus.PENDING || consultation.getConsultationType() != ConsultationType.INSTANT) {
            throw new RuntimeException("Consultation is not in a valid state to be accepted");
        }

        if (consultation.getDoctor() != null && !consultation.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("Consultation already accepted by another doctor");
        }

        consultation.setDoctor(doctor);
        consultation.setStatus(ConsultationStatus.ONGOING);
        consultation.setCallStartedAt(LocalDateTime.now());
        consultationRepository.save(consultation);

        // Update doctor availability stats if needed, or keep as is (already handled in booking usually)
        doctor.setIsAvailable(false);
        doctorRepository.save(doctor);

        return Map.of("consultationId", consultation.getId());
    }

    private DoctorDashboardDTO.ConsultationItemDTO toItemDTO(Consultation c) {
        User p = c.getPatient();
        Integer age = p.getDateOfBirth() != null ? Period.between(p.getDateOfBirth(), LocalDate.now()).getYears() : null;
        
        Integer waitingTime = (c.getConsultationType() == ConsultationType.INSTANT && c.getStatus() == ConsultationStatus.PENDING)
                ? (int) ChronoUnit.MINUTES.between(c.getCreatedAt(), LocalDateTime.now()) : null;

        return DoctorDashboardDTO.ConsultationItemDTO.builder()
                .id(c.getId().toString())
                .patientName(p != null ? p.getFullName() : "Patient")
                .patientAge(age)
                .patientGender(p != null ? p.getGender() : "")
                .scheduledAt(c.getScheduledAt() != null ? c.getScheduledAt().format(ISO_FORMATTER) : LocalDateTime.now().format(ISO_FORMATTER))
                .status(c.getStatus() != null ? c.getStatus().name() : "PENDING")
                .type(c.getConsultationType() != null ? c.getConsultationType().name() : "INSTANT")
                .chiefComplaint(c.getChiefComplaint())
                .waitingTimeMinutes(waitingTime)
                .durationMinutes(c.getCallDurationMinutes())
                .prescriptionAdded(c.getPrescriptionUrl() != null)
                .build();
    }

    /**
     * Fetches a paginated list of available doctors, sorted by rating descending.
     */
    @Transactional(readOnly = true)
    public Page<DoctorListDTO> findAvailableDoctors(int page, int size, String specialization, Double minFee, Double maxFee) {
        Pageable pageable = PageRequest.of(page, size);
        return doctorRepository.findAvailableWithFilters(
                specialization == null || specialization.trim().isEmpty() ? "" : specialization, 
                minFee, 
                maxFee, 
                pageable)
                .map(DoctorMapper::toListDTO);
    }

    @Transactional(readOnly = true)
    public Page<DoctorListDTO> getDoctorsPaginated(String city, String specialization, String language, String sortBy, Boolean available, int page, int size) {
        List<DoctorListDTO> allList = getDoctors(city, specialization, language, sortBy, available);
        int start = Math.min((int) PageRequest.of(page, size).getOffset(), allList.size());
        int end = Math.min((start + size), allList.size());
        return new org.springframework.data.domain.PageImpl<>(allList.subList(start, end), PageRequest.of(page, size), allList.size());
    }

    @Transactional(readOnly = true)
    public List<DoctorListDTO> getDoctors(String city, String specialization, String language, String sortBy, Boolean available) {
        List<Doctor> doctors;
        if (city != null && !city.trim().isEmpty() && specialization != null && !specialization.trim().isEmpty()) {
            doctors = doctorRepository.findByCityIgnoreCaseAndSpecializationAndIsVerifiedTrue(city, specialization);
        } else if (city != null && !city.trim().isEmpty()) {
            doctors = doctorRepository.findByCityIgnoreCaseAndIsVerifiedTrue(city);
        } else if (specialization != null && !specialization.trim().isEmpty()) {
            doctors = doctorRepository.findBySpecializationAndIsVerifiedTrue(specialization);
        } else {
            doctors = doctorRepository.findByIsVerifiedTrue();
        }

        if (language != null && !language.trim().isEmpty()) {
            doctors = doctors.stream()
                .filter(d -> d.getLanguages() != null && d.getLanguages().toLowerCase().contains(language.toLowerCase()))
                .collect(Collectors.toList());
        }

        if (Boolean.TRUE.equals(available)) {
            doctors = doctors.stream().filter(Doctor::getIsAvailable).collect(Collectors.toList());
        } else if (Boolean.FALSE.equals(available)) {
            doctors = doctors.stream().filter(d -> !d.getIsAvailable()).collect(Collectors.toList());
        }

        if (sortBy != null) {
            switch (sortBy) {
                case "rating":
                    doctors.sort((d1, d2) -> Double.compare(d2.getRating(), d1.getRating()));
                    break;
                case "fee_asc":
                    doctors.sort((d1, d2) -> d1.getConsultationFee().compareTo(d2.getConsultationFee()));
                    break;
                case "fee_desc":
                    doctors.sort((d1, d2) -> d2.getConsultationFee().compareTo(d1.getConsultationFee()));
                    break;
                case "experience":
                    doctors.sort((d1, d2) -> Integer.compare(d2.getExperienceYears() != null ? d2.getExperienceYears() : 0, 
                                                             d1.getExperienceYears() != null ? d1.getExperienceYears() : 0));
                    break;
            }
        }

        return doctors.stream().map(DoctorMapper::toListDTO).collect(Collectors.toList());
    }

    @Cacheable(value = "doctorCities")
    public List<String> getAvailableCities() {
        return doctorRepository.findDistinctCities();
    }

    /**
     * Fetches a single doctor with full detail.
     */
    @Transactional(readOnly = true)
    public DoctorDetailDTO findDoctorById(UUID id) {
        Doctor doctor = doctorRepository.findByIdWithUser(id)
                .orElseThrow(() -> new DoctorNotFoundException(id));
        DoctorDetailDTO dto = DoctorMapper.toDetailDTO(doctor);

        try {
            org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                User user = (User) auth.getPrincipal();
                if (user.getUserType() == UserType.PATIENT) {
                    dto.setLatitude(null);
                    dto.setLongitude(null);
                    dto.setClinicPhone(null);
                    dto.setMedicalLicense(null);
                }
            } else {
                dto.setLatitude(null);
                dto.setLongitude(null);
                dto.setClinicPhone(null);
                dto.setMedicalLicense(null);
            }
        } catch (Exception e) {
            dto.setLatitude(null);
            dto.setLongitude(null);
            dto.setClinicPhone(null);
            dto.setMedicalLicense(null);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public DoctorDetailDTO getOwnProfile(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("No doctor profile found for this user"));
        return DoctorMapper.toDetailDTO(doctor);
    }

    @Transactional
    public DoctorDetailDTO updateOwnProfile(UUID userId, DoctorDetailDTO dto) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("No doctor profile found for this user"));
        
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setQualification(dto.getQualification());
        doctor.setExperienceYears(dto.getExperienceYears());
        doctor.setBio(dto.getBio());
        doctor.setLanguages(dto.getLanguages());
        doctor.setCity(dto.getCity());
        doctor.setProfilePictureUrl(dto.getProfilePictureUrl());
        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setClinicName(dto.getClinicName());
        doctor.setClinicAddress(dto.getClinicAddress());
        doctor.setClinicPhone(dto.getClinicPhone());
        
        Doctor saved = doctorRepository.save(doctor);
        return DoctorMapper.toDetailDTO(saved);
    }

    /**
     * Toggles a doctor's availability flag with ongoing call check.
     */
    @Transactional
    public DoctorDetailDTO updateAvailability(UUID userId, boolean isAvailable) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("No doctor profile found for this user"));

        if (!isAvailable) {
            // Check for ongoing consultations before allowing to go offline
            List<Consultation> ongoing = consultationRepository.findByDoctorIdAndStatus(doctor.getId(), ConsultationStatus.ONGOING);
            if (!ongoing.isEmpty()) {
                throw new RuntimeException("Cannot go offline while you have ongoing consultations");
            }
        }

        doctor.setIsAvailable(isAvailable);
        Doctor saved = doctorRepository.save(doctor);

        return DoctorMapper.toDetailDTO(saved);
    }

    @Transactional(readOnly = true)
    public DoctorEarningsDTO getDoctorEarnings(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("No doctor profile found for this user"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime lastMonthStart = now.minusMonths(1).withDayOfMonth(1).with(LocalTime.MIN);

        BigDecimal thisMonth = consultationRepository.calculateMonthlyEarningsRange(doctor.getId(), monthStart, now);
        BigDecimal lastMonth = consultationRepository.calculateMonthlyEarningsRange(doctor.getId(), lastMonthStart, monthStart);
        BigDecimal total = consultationRepository.calculateTotalEarnings(doctor.getId());
        BigDecimal average = consultationRepository.calculateAverageEarningsPerConsultation(doctor.getId());

        List<Object[]> monthlyDataRaw = consultationRepository.getMonthlyEarningsData(doctor.getId());
        List<MonthlyEarningDTO> monthlyData = monthlyDataRaw.stream()
                .map(row -> new MonthlyEarningDTO((String) row[0], ((Number) row[1]).toString() != null ? new BigDecimal(((Number) row[1]).toString()) : BigDecimal.ZERO))
                .collect(Collectors.toList());

        return DoctorEarningsDTO.builder()
                .thisMonthEarnings(thisMonth)
                .lastMonthEarnings(lastMonth)
                .totalEarnings(total)
                .averagePerConsultation(average)
                .monthlyData(monthlyData)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDoctorSchedule(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("No doctor profile found for this user"));
        String json = doctor.getScheduleJson();
        if (json == null || json.isEmpty()) {
            json = "{}";
        }
        return Map.of("schedule", json);
    }

    @Transactional
    public void setWeeklyHours(UUID userId, String scheduleJson) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("No doctor profile found for this user"));
        doctor.setScheduleJson(scheduleJson);
        doctorRepository.save(doctor);
    }

    @Transactional(readOnly = true)
    public Page<DoctorListDTO> getAllAdminDoctors(String search, String specialization, Boolean available, Pageable pageable) {
        return doctorRepository.findAdminDoctors(
                search == null || search.trim().isEmpty() ? "" : search.trim(),
                specialization == null || specialization.trim().isEmpty() ? "" : specialization, 
                available, 
                pageable)
                .map(DoctorMapper::toListDTO);
    }

    @Transactional
    public DoctorListDTO updateDoctorInfo(UUID id, AdminDoctorRequestDTO request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        User user = doctor.getUser();

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());

        DoctorMapper.updateDoctorFromRequest(doctor, request);

        doctorRepository.save(doctor);
        return DoctorMapper.toListDTO(doctor);
    }

    @Transactional
    public void deleteDoctorEntity(UUID id) {
        User callingUser = userRepository.findByFirebaseUid(SecurityContextHolder.getContext().getAuthentication().getName())
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!callingUser.getUserType().equals(UserType.ADMIN)) {
            throw new UnauthorizedException("Only admins can delete doctor profiles");
        }

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Step 1: Delete prescriptions — they FK on both consultation_id AND doctor_id, so must go first.
        List<Prescription> doctorPrescriptions = prescriptionRepository.findByDoctorId(doctor.getId());
        prescriptionRepository.deleteAll(doctorPrescriptions);

        // Step 2: Delete consultation ratings — FK on consultation_id and doctor_id.
        List<Consultation> doctorConsultations = consultationRepository.findByDoctorId(doctor.getId());
        for (Consultation consultation : doctorConsultations) {
            ratingRepository.findByConsultationId(consultation.getId())
                    .ifPresent(ratingRepository::delete);
        }

        // Step 3: Delete consultations — FK on doctor_id.
        consultationRepository.deleteAll(doctorConsultations);

        // Step 4: Safe to delete the doctor profile now.
        // Demote the linked user back to PATIENT rather than deleting the account.
        User user = doctor.getUser();
        doctorRepository.delete(doctor);
        user.setUserType(UserType.PATIENT);
    }
}
