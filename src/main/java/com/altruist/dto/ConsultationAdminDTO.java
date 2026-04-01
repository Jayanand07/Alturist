package com.altruist.dto;

import com.altruist.model.ConsultationStatus;
import com.altruist.model.ConsultationType;
import com.altruist.model.PaymentStatus;
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
public class ConsultationAdminDTO {
    private UUID id;
    
    // Patient Info
    private String patientName;
    private String patientEmail;
    
    // Doctor Info
    private String doctorName;
    private String doctorSpecialization;
    
    // Consultation Details
    private LocalDateTime scheduledAt;
    private ConsultationType consultationType;
    private ConsultationStatus status;
    private PaymentStatus paymentStatus;
    private BigDecimal amount;
    private String videoRoomId;
    private String prescriptionUrl;
    private LocalDateTime createdAt;
    
    // Optional extras for timeline
    private LocalDateTime callStartedAt;
    private LocalDateTime callEndedAt;
    private Integer callDurationMinutes;
}
