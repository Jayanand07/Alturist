package com.altruist.controller;

import com.altruist.dto.LabBookingRequestDTO;
import com.altruist.dto.LabBookingResponseDTO;
import com.altruist.model.User;
import com.altruist.service.LabBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LabBookingController {

    private final LabBookingService labBookingService;

    @PostMapping("/lab-bookings")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<LabBookingResponseDTO> createBooking(@Valid @RequestBody LabBookingRequestDTO dto) {
        User patient = getAuthenticatedUser();
        if (patient == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(labBookingService.createBooking(patient, dto));
    }

    @GetMapping("/patient/lab-bookings")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Page<LabBookingResponseDTO>> getPatientBookings(Pageable pageable) {
        User patient = getAuthenticatedUser();
        if (patient == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // Securing user details by deriving patient id strictly from context principal
        return ResponseEntity.ok(labBookingService.getPatientBookings(patient.getId(), pageable));
    }

    @GetMapping("/admin/lab-bookings")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<LabBookingResponseDTO>> getAdminBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(labBookingService.getAdminBookings(status, search, pageable));
    }

    @PutMapping("/admin/lab-bookings/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<LabBookingResponseDTO> updateBookingStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String notes = body.get("notes");
        return ResponseEntity.ok(labBookingService.updateBookingStatus(id, status, notes));
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }
        return (User) authentication.getPrincipal();
    }
}
