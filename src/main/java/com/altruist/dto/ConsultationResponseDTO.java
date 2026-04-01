package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponseDTO {
    private UUID consultationId;
    private String videoRoomId;
    private String videoRoomUrl;
    private UUID patientId;
    private UUID doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String doctorProfilePictureUrl;
    private String patientName;
    private LocalDateTime scheduledAt;
    private BigDecimal amount;
    private String status;
    private String type;
    private String diagnosis;
    private String prescriptionUrl;
    private Boolean isRescheduleRequested;
    private LocalDateTime proposedRescheduleTime;
    private String rescheduleReason;
}
