package com.altruist.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DoctorDashboardDTO {
    private String doctorName;
    private Boolean isAvailable;
    private Stats stats;
    private List<ConsultationItemDTO> todaysSchedule;
    private List<ConsultationItemDTO> pendingInstantConsultations;
    private List<ConsultationItemDTO> recentConsultations;

    @Data
    @Builder
    public static class Stats {
        private Long todaysConsultations;
        private BigDecimal monthlyEarnings;
        private Double averageRating;
        private Integer totalPatientsTreated;
    }

    @Data
    @Builder
    public static class ConsultationItemDTO {
        private String id;
        private String patientName;
        private Integer patientAge;
        private String patientGender;
        private String scheduledAt;
        private String status;
        private String type;
        private String chiefComplaint;
        private Integer waitingTimeMinutes; // For instant bookings
        private Integer durationMinutes; // For completed bookings
        private Boolean prescriptionAdded;
    }
}
