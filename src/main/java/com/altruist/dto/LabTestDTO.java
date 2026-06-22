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
public class LabTestDTO {
    private UUID id;

    @NotBlank(message = "Lab test name is required")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    private BigDecimal discountedPrice;

    private Integer discountPercent;

    private Integer includesCount;

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Boolean isActive = true;

    private String[] parametersIncluded;
    private Integer reportTimeHours;
    private Boolean freeHomeCollection;
}
