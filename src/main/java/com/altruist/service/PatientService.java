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

@Service
@RequiredArgsConstructor
public class PatientService {

    private final ConsultationRepository consultationRepository;

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
                                    .name("Dr. " + c.getDoctor().getUser().getFullName())
                                    .specialization(c.getDoctor().getSpecialization())
                                    .profilePicture(c.getDoctor().getUser().getProfilePictureUrl())
                                    .build())
                            .scheduledAt(c.getScheduledAt().format(ISO_FORMATTER))
                            .status(c.getStatus().name())
                            .canJoinNow(canJoinNow)
                            .build();
                })
                .collect(Collectors.toList());

        // 3. Recent Prescriptions (last 30 days completed consultations with prescriptions)
        LocalDateTime last30Days = now.minusDays(30);
        List<PatientDashboardDTO.RecentPrescriptionDTO> recentPrescriptions = consultationRepository
                .findByPatientIdAndStatus(patientId, ConsultationStatus.COMPLETED).stream()
                .filter(c -> c.getScheduledAt().isAfter(last30Days) && c.getDiagnosis() != null && c.getDiagnosis().contains("PRESCRIPTION DATA"))
                .sorted((a, b) -> b.getScheduledAt().compareTo(a.getScheduledAt()))
                .limit(5)
                .map(c -> PatientDashboardDTO.RecentPrescriptionDTO.builder()
                        .id(c.getId().toString())
                        .doctorName("Dr. " + c.getDoctor().getUser().getFullName())
                        .issuedAt((c.getCallEndedAt() != null ? c.getCallEndedAt() : c.getScheduledAt()).format(ISO_FORMATTER))
                        .medicinesCount(extractMedicinesCount(c.getDiagnosis()))
                        .prescriptionUrl(c.getPrescriptionUrl()) // Return actual URL if populated
                        .build())
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
                .doctorName("Dr. " + c.getDoctor().getUser().getFullName())
                .specialization(c.getDoctor().getSpecialization())
                .profilePicture(c.getDoctor().getUser().getProfilePictureUrl())
                .scheduledAt(c.getScheduledAt().format(ISO_FORMATTER))
                .status(c.getStatus().name())
                .type(c.getConsultationType().name())
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
}
