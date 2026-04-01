package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDTO {
    private String name;
    private String genericName;
    private String manufacturer;
    private String category;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    @Builder.Default
    private Boolean requiresPrescription = false;
    @Builder.Default
    private Boolean inStock = true;
    private String description;
}
