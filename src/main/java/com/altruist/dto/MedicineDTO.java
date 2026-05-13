package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDTO {
    private java.util.UUID id;
    @NotBlank(message = "Medicine name is required")
    private String name;
    private String genericName;
    @NotBlank(message = "Manufacturer is required")
    private String manufacturer;
    private String category;
    @NotNull(message = "Price is required")
    private BigDecimal price;
    private BigDecimal discountedPrice;
    @Builder.Default
    private Boolean requiresPrescription = false;
    @Builder.Default
    private Boolean inStock = true;
    @Builder.Default
    private Integer stockQuantity = 0;
    private String description;
    private String imageUrl;
}
