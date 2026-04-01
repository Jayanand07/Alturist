package com.altruist.dto;

import com.altruist.model.OrderStatus;
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
public class OrderResponseDTO {
    private UUID id;
    private String patientName;
    private String items;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private OrderStatus status;
    private String prescriptionUrl;
    private LocalDateTime createdAt;
}
