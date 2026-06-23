package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicMedicineDTO {
    private UUID id;
    private String name;
    private String manufacturer;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private Boolean requiresPrescription;
    private String description;
    private String imageUrl;
}
