package com.altruist.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PatientDashboardDTO {
    private Stats stats;
    private List<UpcomingConsultationDTO> upcomingConsultations;
    private List<RecentPrescriptionDTO> recentPrescriptions;
    private List<String> healthTips;

    @Data
    @Builder
    public static class Stats {
        private Long totalConsultations;
        private Long upcomingAppointments;
        private Long activePrescriptions;
    }

    @Data
    @Builder
    public static class UpcomingConsultationDTO {
        private String id;
        private DoctorSummary doctor;
        private String scheduledAt;
        private String status;
        private boolean canJoinNow;
    }

    @Data
    @Builder
    public static class DoctorSummary {
        private String name;
        private String specialization;
        private String profilePicture;
    }

    @Data
    @Builder
    public static class RecentPrescriptionDTO {
        private String id;
        private String doctorName;
        private String issuedAt;
        private int medicinesCount;
        private String prescriptionUrl;
    }
}
