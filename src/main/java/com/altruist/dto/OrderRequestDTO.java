package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemDTO> items;
    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;
    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
    private String prescriptionUrl;
}
