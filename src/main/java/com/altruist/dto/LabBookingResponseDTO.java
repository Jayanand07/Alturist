package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabBookingResponseDTO {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private String patientPhone;
    private UUID labTestId;
    private String labTestName;
    private UUID labPackageId;
    private String labPackageName;
    private String bookingType; // 'TEST' or 'PACKAGE'
    private LocalDate preferredDate;
    private String preferredTimeSlot;
    private String address;
    private String phone;
    private String status; // 'PENDING', 'CONFIRMED', etc.
    private BigDecimal amount;
    private String paymentStatus;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
