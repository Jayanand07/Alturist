package com.altruist.service;

import com.altruist.dto.OrderRequestDTO;
import com.altruist.dto.OrderResponseDTO;
import com.altruist.model.Order;
import com.altruist.model.OrderStatus;
import com.altruist.model.User;
import com.altruist.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public OrderResponseDTO createOrder(User patient, OrderRequestDTO dto) {
        try {
            String itemsJson = objectMapper.writeValueAsString(dto.getItems());
            
            Order order = Order.builder()
                    .patient(patient)
                    .items(itemsJson)
                    .totalAmount(dto.getTotalAmount())
                    .deliveryAddress(dto.getDeliveryAddress())
                    .status(OrderStatus.PENDING)
                    .prescriptionUrl(dto.getPrescriptionUrl())
                    .build();

            Order savedOrder = orderRepository.save(order);
            return mapToResponseDTO(savedOrder);
        } catch (JsonProcessingException e) {
            log.error("Error serializing order items", e);
            throw new RuntimeException("Failed to process order items");
        }
    }

    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getPatientOrders(User patient, Pageable pageable) {
        return orderRepository.findByPatient(patient, pageable)
                .map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getAllOrders(Pageable pageable) {
        // IMPORTANT: findAllByOrderByCreatedAtDesc MUST apply Pageable at DB level not in Java memory
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponseDTO);
    }

    private OrderResponseDTO mapToResponseDTO(Order order) {
        return OrderResponseDTO.builder()
                .id(order.getId())
                .patientName(order.getPatient().getFullName())
                .items(order.getItems())
                .totalAmount(order.getTotalAmount())
                .deliveryAddress(order.getDeliveryAddress())
                .status(order.getStatus())
                .prescriptionUrl(order.getPrescriptionUrl())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
