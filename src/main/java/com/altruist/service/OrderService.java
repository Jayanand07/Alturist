package com.altruist.service;

import com.altruist.dto.NotificationDTO;
import com.altruist.dto.OrderItemDTO;
import com.altruist.dto.OrderRequestDTO;
import com.altruist.dto.OrderResponseDTO;
import com.altruist.event.OrderNotificationEvent;
import com.altruist.model.Medicine;
import com.altruist.model.Order;
import com.altruist.model.OrderStatus;
import com.altruist.model.SupportMessage;
import com.altruist.model.SupportTicket;
import com.altruist.model.User;
import com.altruist.repository.MedicineRepository;
import com.altruist.repository.OrderRepository;
import com.altruist.repository.SupportMessageRepository;
import com.altruist.repository.SupportTicketRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private static final int MAX_QUANTITY_PER_ITEM = 100;

    /**
     * Valid state-machine transitions.
     *
     * PENDING   → CONFIRMED, CANCELLED
     * CONFIRMED → SHIPPED,   CANCELLED
     * SHIPPED   → DELIVERED
     * DELIVERED → (terminal)
     * CANCELLED → (terminal)
     *
     * Future gap: SHIPPED → CANCELLED is intentionally blocked.
     * A future RETURNED status will handle refused/returned shipments.
     */
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            OrderStatus.PENDING,   EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.SHIPPED,   OrderStatus.CANCELLED),
            OrderStatus.SHIPPED,   EnumSet.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class)
    );

    private final OrderRepository            orderRepository;
    private final MedicineRepository         medicineRepository;
    private final SupportTicketRepository    supportTicketRepository;
    private final SupportMessageRepository   supportMessageRepository;
    private final ApplicationEventPublisher  eventPublisher;
    private final ObjectMapper               objectMapper;

    // ── Create Order ─────────────────────────────────────────────────────────

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public OrderResponseDTO createOrder(User patient, OrderRequestDTO dto) {
        try {
            List<OrderItemDTO> requestedItems = dto.getItems();

            // ── 1. Validate quantities and collect medicine IDs ───────────────
            List<UUID> medicineIds = new ArrayList<>();
            for (OrderItemDTO item : requestedItems) {
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    throw new ValidationException("Item quantity must be at least 1");
                }
                if (item.getQuantity() > MAX_QUANTITY_PER_ITEM) {
                    throw new ValidationException(
                            "Item quantity cannot exceed " + MAX_QUANTITY_PER_ITEM + " per item");
                }
                try {
                    medicineIds.add(UUID.fromString(item.getId()));
                } catch (IllegalArgumentException e) {
                    throw new ValidationException("Invalid medicine ID: " + item.getId());
                }
            }

            // ── 2. Batch-fetch medicine records (ignores client-sent price) ───
            Map<UUID, Medicine> medicineMap = medicineRepository.findAllById(medicineIds)
                    .stream()
                    .collect(Collectors.toMap(Medicine::getId, m -> m));

            if (medicineMap.size() != medicineIds.size()) {
                throw new ValidationException("One or more medicines in the order were not found");
            }

            // ── 3. Validate stock/availability + recompute total server-side ──
            BigDecimal serverTotal = BigDecimal.ZERO;
            List<OrderItemDTO> verifiedItems = new ArrayList<>();

            for (OrderItemDTO item : requestedItems) {
                UUID medId = UUID.fromString(item.getId());
                Medicine med = medicineMap.get(medId);

                if (!Boolean.TRUE.equals(med.getInStock())) {
                    throw new ValidationException(
                            "Medicine '" + med.getName() + "' is currently unavailable");
                }
                if (med.getStockQuantity() == null || med.getStockQuantity() <= 0) {
                    throw new ValidationException(
                            "Medicine '" + med.getName() + "' is out of stock");
                }

                BigDecimal unitPrice = (med.getDiscountedPrice() != null
                        && med.getDiscountedPrice().compareTo(BigDecimal.ZERO) > 0)
                        ? med.getDiscountedPrice()
                        : med.getPrice();

                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                serverTotal = serverTotal.add(lineTotal);

                verifiedItems.add(new OrderItemDTO(
                        item.getId(),
                        med.getName(),
                        med.getManufacturer(),
                        med.getPrice(),
                        med.getDiscountedPrice(),
                        item.getQuantity(),
                        lineTotal
                ));
            }

            // ── 4. Persist order with server-computed total ───────────────────
            String itemsJson = objectMapper.writeValueAsString(verifiedItems);

            Order order = Order.builder()
                    .patient(patient)
                    .items(itemsJson)
                    .totalAmount(serverTotal)      // client-sent totalAmount is ignored
                    .deliveryAddress(dto.getDeliveryAddress())
                    .status(OrderStatus.PENDING)
                    .prescriptionUrl(dto.getPrescriptionUrl())
                    .paymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "COD")
                    .build();

            Order savedOrder = orderRepository.save(order);

            // ── 5. Auto-create support ticket for COD orders ──────────────────
            if ("COD".equalsIgnoreCase(savedOrder.getPaymentMethod())) {
                createSupportTicketForCODOrder(savedOrder);
            }

            // ── 6. Publish notification event (fires AFTER_COMMIT via listener) ─
            // This avoids the race condition where SSE could be pushed before the
            // DB row is committed and visible to other readers.
            eventPublisher.publishEvent(new OrderNotificationEvent(
                    this,
                    patient.getId(),
                    savedOrder.getId(),
                    "Order Placed Successfully",
                    String.format("Your order #%s for INR %.2f has been placed and is awaiting confirmation.",
                            savedOrder.getId(), savedOrder.getTotalAmount()),
                    "ORDER_PLACED"
            ));

            return mapToResponseDTO(savedOrder);

        } catch (ValidationException e) {
            throw e;
        } catch (JsonProcessingException e) {
            log.error("Error serializing order items", e);
            throw new RuntimeException("Failed to process order items");
        }
    }

    // ── Update Order Status (Admin) ───────────────────────────────────────────

    /**
     * Transitions an order through the state machine with optimistic locking.
     *
     * Concurrent admin updates on the same Order row are protected by @Version:
     * the second writer will see a stale version and get OptimisticLockException
     * (mapped to 409 by GlobalExceptionHandler) instead of silently overwriting.
     *
     * The SSE notification is published AFTER_COMMIT via OrderEventListener to
     * prevent the race condition between DB commit and SSE delivery.
     */
    @Transactional
    public OrderResponseDTO updateOrderStatus(UUID orderId, String newStatusStr) {
        // ── Parse status string cleanly — invalid strings get 400, not 500 ───
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(newStatusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException(
                    "Invalid order status: '" + newStatusStr + "'. Valid values: "
                    + java.util.Arrays.toString(OrderStatus.values()));
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Order not found: " + orderId));

        OrderStatus current = order.getStatus();

        // ── State machine guard ───────────────────────────────────────────────
        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(OrderStatus.class));
        if (!allowed.contains(newStatus)) {
            throw new ValidationException(
                    "Cannot transition order from " + current + " to " + newStatus
                    + ". Allowed transitions from " + current + ": " + allowed);
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);   // @Version check happens here

        log.info("Order {} status updated: {} → {} ", orderId, current, newStatus);

        // ── Publish AFTER_COMMIT notification event ───────────────────────────
        String[] titleAndMessage = notificationTextFor(newStatus, saved.getId());
        eventPublisher.publishEvent(new OrderNotificationEvent(
                this,
                saved.getPatient().getId(),
                saved.getId(),
                titleAndMessage[0],
                titleAndMessage[1],
                "ORDER_" + newStatus.name()
        ));

        return mapToResponseDTO(saved);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getPatientOrders(User patient, Pageable pageable) {
        return orderRepository.findByPatient(patient, pageable)
                .map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponseDTO);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Returns [title, message] for the patient-facing notification of a status transition. */
    private String[] notificationTextFor(OrderStatus status, UUID orderId) {
        return switch (status) {
            case CONFIRMED -> new String[]{
                "Order Confirmed",
                String.format("Your order #%s has been confirmed and is being prepared.", orderId)
            };
            case SHIPPED -> new String[]{
                "Order Shipped",
                String.format("Your order #%s is on its way!", orderId)
            };
            case DELIVERED -> new String[]{
                "Order Delivered",
                String.format("Your order #%s has been delivered. Enjoy!", orderId)
            };
            case CANCELLED -> new String[]{
                "Order Cancelled",
                String.format("Your order #%s has been cancelled.", orderId)
            };
            default -> new String[]{
                "Order Update",
                String.format("Your order #%s status has been updated to %s.", orderId, status)
            };
        };
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

            log.info("Automatically created COD order support ticket {} for patient {}",
                    ticket.getId(), order.getPatient().getId());
        } catch (Exception e) {
            log.error("Failed to automatically create support ticket for COD order {}", order.getId(), e);
        }
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
