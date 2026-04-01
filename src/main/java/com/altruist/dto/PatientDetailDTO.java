package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDetailDTO {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
    private LocalDateTime createdAt;
    private long totalConsultations;
    private long prescriptionCount;
    private List<RecentConsultationDTO> recentConsultations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentConsultationDTO {
        private UUID id;
        private String doctorName;
        private String specialization;
        private LocalDateTime scheduledAt;
        private String status;
        private java.math.BigDecimal amount;
    }
}
