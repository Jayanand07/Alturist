package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private String id;
    private String name;
    private String manufacturer;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}
