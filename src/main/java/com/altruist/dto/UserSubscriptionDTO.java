package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscriptionDTO {
    private UUID id;
    private String planName;
    private String billingCycle;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextBillingDate;
    private Integer consultationsUsed;
    private Integer consultationsRemaining;
    private BigDecimal monthlyPrice;
    private BigDecimal yearlyPrice;
    private String patientName;
}
