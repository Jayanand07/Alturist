package com.altruist.service;

import com.altruist.dto.ConsultationHistoryDTO;
import com.altruist.dto.PatientDashboardDTO;
import com.altruist.model.Consultation;
import com.altruist.model.ConsultationStatus;
import com.altruist.model.User;
import com.altruist.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.altruist.dto.PatientProfileDTO;
import com.altruist.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Transactional(readOnly = true)
    public PatientDashboardDTO getDashboardData(User user) {
        UUID patientId = user.getId();
        LocalDateTime now = LocalDateTime.now();

        // 1. Stats calculation (Optimize to count queries if large dataset, but for now we'll fetch ID lists or use basic counts)
        long totalConsultations = consultationRepository.findByPatientId(patientId).size();
        long upcomingAppointments = consultationRepository.findByPatientId(patientId).stream()
                .filter(c -> (c.getStatus() == ConsultationStatus.PENDING || c.getStatus() == ConsultationStatus.ONGOING) 
                          && c.getScheduledAt().isAfter(now))
                .count();
        // Since prescriptions are currently stored as string in diagnosis
        long activePrescriptions = consultationRepository.findByPatientIdAndStatus(patientId, ConsultationStatus.COMPLETED).stream()
                .filter(c -> c.getDiagnosis() != null && c.getDiagnosis().contains("PRESCRIPTION DATA"))
                .count();

        // 2. Upcoming consultations (next 7 days) via EntityGraph
        LocalDateTime next7Days = now.plusDays(7);
        List<Consultation> upcomingList = consultationRepository
                .findByPatientIdAndScheduledAtBetweenOrderByScheduledAtAsc(patientId, now.minusMinutes(30), next7Days)
                .stream()
                .filter(c -> c.getStatus() == ConsultationStatus.PENDING || c.getStatus() == ConsultationStatus.ONGOING)
                .collect(Collectors.toList());

        List<PatientDashboardDTO.UpcomingConsultationDTO> upcomingDTOs = upcomingList.stream()
                .map(c -> {
                    boolean canJoinNow = false;
                    if (c.getScheduledAt() != null) {
                        long diff = ChronoUnit.MINUTES.between(now, c.getScheduledAt());
                        canJoinNow = diff <= 10 && diff >= -60; // From 10 mins before until 60 mins after
                    }

                    return PatientDashboardDTO.UpcomingConsultationDTO.builder()
                            .id(c.getId().toString())
                            .doctor(PatientDashboardDTO.DoctorSummary.builder()
                                    .name(c.getDoctor() != null && c.getDoctor().getUser() != null ? "Dr. " + c.getDoctor().getUser().getFullName() : "Doctor")
                                    .specialization(c.getDoctor() != null ? c.getDoctor().getSpecialization() : "Specialist")
                                    .profilePicture(c.getDoctor() != null && c.getDoctor().getUser() != null ? c.getDoctor().getUser().getProfilePictureUrl() : null)
                                    .build())
                            .scheduledAt(c.getScheduledAt() != null ? c.getScheduledAt().format(ISO_FORMATTER) : LocalDateTime.now().format(ISO_FORMATTER))
                            .status(c.getStatus() != null ? c.getStatus().name() : "PENDING")
                            .canJoinNow(canJoinNow)
                            .build();
                })
                .collect(Collectors.toList());

        // 3. Recent Prescriptions (last 30 days completed consultations with prescriptions)
        LocalDateTime last30Days = now.minusDays(30);
        List<PatientDashboardDTO.RecentPrescriptionDTO> recentPrescriptions = consultationRepository
                .findByPatientIdAndStatus(patientId, ConsultationStatus.COMPLETED).stream()
                .filter(c -> c.getScheduledAt() != null && c.getScheduledAt().isAfter(last30Days) && c.getDiagnosis() != null && c.getDiagnosis().contains("PRESCRIPTION DATA"))
                .sorted((a, b) -> b.getScheduledAt().compareTo(a.getScheduledAt()))
                .limit(5)
                .map(c -> {
                    LocalDateTime dt = c.getCallEndedAt() != null ? c.getCallEndedAt() : c.getScheduledAt();
                    return PatientDashboardDTO.RecentPrescriptionDTO.builder()
                        .id(c.getId().toString())
                        .doctorName(c.getDoctor() != null && c.getDoctor().getUser() != null ? "Dr. " + c.getDoctor().getUser().getFullName() : "Doctor")
                        .issuedAt(dt != null ? dt.format(ISO_FORMATTER) : LocalDateTime.now().format(ISO_FORMATTER))
                        .medicinesCount(extractMedicinesCount(c.getDiagnosis()))
                        .prescriptionUrl(c.getPrescriptionUrl()) // Return actual URL if populated
                        .build();
                })
                .collect(Collectors.toList());

        // 4. Random health tips (using cached list)
        List<String> randomTips = getHealthTips();
        Collections.shuffle(randomTips);

        return PatientDashboardDTO.builder()
                .stats(PatientDashboardDTO.Stats.builder()
                        .totalConsultations(totalConsultations)
                        .upcomingAppointments(upcomingAppointments)
                        .activePrescriptions(activePrescriptions)
                        .build())
                .upcomingConsultations(upcomingDTOs)
                .recentPrescriptions(recentPrescriptions)
                .healthTips(randomTips.stream().limit(3).collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ConsultationHistoryDTO> getConsultationHistory(
            UUID patientId, Pageable pageable, String status, String dateRange, String specialization) {

        Specification<Consultation> spec = Specification.where((root, query, cb) -> 
            cb.equal(root.get("patient").get("id"), patientId));

        if (status != null && !status.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), ConsultationStatus.valueOf(status.toUpperCase())));
        }

        if (specialization != null && !specialization.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("doctor").get("specialization"), specialization));
        }

        if (dateRange != null && !dateRange.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startDate = null;
            if ("LAST_30_DAYS".equals(dateRange)) {
                startDate = now.minusDays(30);
            } else if ("LAST_6_MONTHS".equals(dateRange)) {
                startDate = now.minusMonths(6);
            }
            if (startDate != null) {
                LocalDateTime finalStartDate = startDate;
                spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("scheduledAt"), finalStartDate));
            }
        }

        Page<Consultation> consultations = consultationRepository.findAll(spec, pageable);

        return consultations.map(c -> ConsultationHistoryDTO.builder()
                .id(c.getId().toString())
                .doctorName(c.getDoctor() != null && c.getDoctor().getUser() != null ? "Dr. " + c.getDoctor().getUser().getFullName() : "Doctor")
                .specialization(c.getDoctor() != null ? c.getDoctor().getSpecialization() : "Specialist")
                .profilePicture(c.getDoctor() != null && c.getDoctor().getUser() != null ? c.getDoctor().getUser().getProfilePictureUrl() : null)
                .scheduledAt(c.getScheduledAt() != null ? c.getScheduledAt().format(ISO_FORMATTER) : LocalDateTime.now().format(ISO_FORMATTER))
                .status(c.getStatus() != null ? c.getStatus().name() : "PENDING")
                .type(c.getConsultationType() != null ? c.getConsultationType().name() : "INSTANT")
                .amount(c.getAmount() != null ? c.getAmount().toString() : "0.0")
                .build());
    }

    @Cacheable("healthTips")
    public List<String> getHealthTips() {
        return List.of(
                "Drink at least 8 glasses of water daily",
                "Exercise for 30 minutes every day",
                "Maintain a consistent sleep schedule",
                "Wash hands frequently to avoid infections",
                "Take regular screen breaks using the 20-20-20 rule",
                "Eat a balanced diet rich in leafy greens"
        );
    }

    private int extractMedicinesCount(String diagnosis) {
        // Very basic mock extraction since data is JSON string inside diagnosis
        // Real implementation would parse JSON or just return fixed for now
        if (diagnosis != null && diagnosis.contains("PRESCRIPTION DATA")) {
            return 3; // Placeholder for UI
        }
        return 0;
    }

    @Transactional(readOnly = true)
    public PatientProfileDTO getPatientProfile(User user) {
        return PatientProfileDTO.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null)
                .gender(user.getGender())
                .profilePictureUrl(user.getProfilePictureUrl())
                .bloodGroup(user.getBloodGroup())
                .street(user.getStreet())
                .city(user.getCity())
                .state(user.getState())
                .pincode(user.getPincode())
                .allergies(user.getAllergies())
                .chronicConditions(user.getChronicConditions())
                .currentMedications(user.getCurrentMedications())
                .emailAlerts(user.getEmailAlerts())
                .smsAlerts(user.getSmsAlerts())
                .appointmentReminders(user.getAppointmentReminders())
                .build();
    }

    @Transactional
    public PatientProfileDTO updatePatientProfile(User authUser, PatientProfileDTO dto) {
        User user = userRepository.findById(authUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getDateOfBirth() != null && !dto.getDateOfBirth().isEmpty()) {
            user.setDateOfBirth(java.time.LocalDate.parse(dto.getDateOfBirth()));
        }
        if (dto.getGender() != null) user.setGender(dto.getGender());
        if (dto.getProfilePictureUrl() != null) user.setProfilePictureUrl(dto.getProfilePictureUrl());
        if (dto.getBloodGroup() != null) user.setBloodGroup(dto.getBloodGroup());
        
        if (dto.getStreet() != null) user.setStreet(dto.getStreet());
        if (dto.getCity() != null) user.setCity(dto.getCity());
        if (dto.getState() != null) user.setState(dto.getState());
        if (dto.getPincode() != null) user.setPincode(dto.getPincode());
        
        if (dto.getAllergies() != null) user.setAllergies(dto.getAllergies());
        if (dto.getChronicConditions() != null) user.setChronicConditions(dto.getChronicConditions());
        if (dto.getCurrentMedications() != null) user.setCurrentMedications(dto.getCurrentMedications());
        
        if (dto.getEmailAlerts() != null) user.setEmailAlerts(dto.getEmailAlerts());
        if (dto.getSmsAlerts() != null) user.setSmsAlerts(dto.getSmsAlerts());
        if (dto.getAppointmentReminders() != null) user.setAppointmentReminders(dto.getAppointmentReminders());

        userRepository.save(user);
        return getPatientProfile(user);
    }
}
