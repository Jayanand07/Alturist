package com.altruist.controller;

import com.altruist.dto.OrderRequestDTO;
import com.altruist.dto.OrderResponseDTO;
import com.altruist.model.User;
import com.altruist.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<OrderResponseDTO> createOrder(
            @AuthenticationPrincipal User patient,
            @RequestBody OrderRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(patient, dto));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Page<OrderResponseDTO>> getMyOrders(
            @AuthenticationPrincipal User patient,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getPatientOrders(patient, pageable));
    }
}
