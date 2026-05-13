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
public class MedicineResponseDTO {
    private UUID id;
    private String name;
    private String genericName;
    private String manufacturer;
    private String category;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private Boolean requiresPrescription;
    private Boolean inStock;
    private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
