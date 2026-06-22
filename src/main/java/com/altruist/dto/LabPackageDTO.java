package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabPackageDTO {
    private UUID id;

    @NotBlank(message = "Package name is required")
    private String name;

    private String description;

    private Integer includesTestCount;

    private String[] testNames;

    @NotNull(message = "Original price is required")
    private BigDecimal originalPrice;

    private BigDecimal discountedPrice;

    private Integer discountPercent;

    @Builder.Default
    private Boolean smartReportIncluded = false;

    @Builder.Default
    private Boolean isActive = true;
}
