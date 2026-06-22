package com.altruist.service;

import com.altruist.dto.OrderRequestDTO;
import com.altruist.dto.OrderResponseDTO;
import com.altruist.model.Order;
import com.altruist.model.OrderStatus;
import com.altruist.model.SupportMessage;
import com.altruist.model.SupportTicket;
import com.altruist.model.User;
import com.altruist.repository.OrderRepository;
import com.altruist.repository.SupportMessageRepository;
import com.altruist.repository.SupportTicketRepository;
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
    private final SupportTicketRepository supportTicketRepository;
    private final SupportMessageRepository supportMessageRepository;
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
                    .paymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "COD")
                    .build();

            Order savedOrder = orderRepository.save(order);
            
            // Automatically create a support ticket for COD delivery if chosen
            if ("COD".equalsIgnoreCase(savedOrder.getPaymentMethod())) {
                createSupportTicketForCODOrder(savedOrder);
            }

            return mapToResponseDTO(savedOrder);
        } catch (JsonProcessingException e) {
            log.error("Error serializing order items", e);
            throw new RuntimeException("Failed to process order items");
        }
    }

    private void createSupportTicketForCODOrder(Order order) {
        try {
            SupportTicket ticket = new SupportTicket();
            ticket.setPatient(order.getPatient());
            ticket.setSubject("New COD Order - Delivery Action Required");
            ticket.setCategory("ORDER");
            ticket.setPriority("HIGH");
            ticket.setStatus("OPEN");
            ticket = supportTicketRepository.save(ticket);

            String messageText = String.format(
                "Patient %s has placed a Cash on Delivery (COD) order.\n\n" +
                "Order Details:\n" +
                "- Order ID: %s\n" +
                "- Amount: INR %.2f\n" +
                "- Phone: %s\n" +
                "- Delivery Address: %s\n\n" +
                "Action Required: Please arrange for delivery and collection of the cash amount.",
                order.getPatient().getFullName(),
                order.getId(),
                order.getTotalAmount(),
                order.getPatient().getPhone() != null ? order.getPatient().getPhone() : "Not provided",
                order.getDeliveryAddress()
            );

            SupportMessage message = new SupportMessage();
            message.setTicket(ticket);
            message.setSender(order.getPatient());
            message.setMessage(messageText);
            message.setSenderRole("PATIENT");
            message.setIsRead(false);
            supportMessageRepository.save(message);

            log.info("Automatically created COD order support ticket {} for patient {}", ticket.getId(), order.getPatient().getId());
        } catch (Exception e) {
            log.error("Failed to automatically create support ticket for COD order {}", order.getId(), e);
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
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
