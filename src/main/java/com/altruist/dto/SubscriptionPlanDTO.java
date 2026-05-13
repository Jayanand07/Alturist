package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanDTO {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal monthlyPrice;
    private BigDecimal yearlyPrice;
    private Integer consultationsPerMonth;
    private Boolean labDiscountEnabled;
    private Integer labDiscountPercent;
    private Boolean medicineDiscountEnabled;
    private Integer medicineDiscountPercent;
    private Boolean prioritySupport;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
