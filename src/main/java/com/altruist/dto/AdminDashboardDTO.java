package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {
    private StatsDTO stats;
    private List<RecentConsultationDTO> recentConsultations;
    private List<RecentUserDTO> recentUsers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsDTO {
        private long totalDoctors;
        private long totalPatients;
        private long todayConsultations;
        private BigDecimal monthlyRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentConsultationDTO {
        private UUID id;
        private String patientName;
        private String doctorName;
        private LocalDateTime scheduledAt;
        private String status;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentUserDTO {
        private UUID id;
        private String fullName;
        private String email;
        private String userType;
        private LocalDateTime createdAt;
    }
}
