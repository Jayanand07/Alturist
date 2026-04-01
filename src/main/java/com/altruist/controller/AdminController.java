package com.altruist.controller;

import com.altruist.dto.*;
import com.altruist.model.ConsultationStatus;
import com.altruist.service.AdminService;
import com.altruist.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/doctors")
    public ResponseEntity<Page<DoctorListDTO>> getAdminDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Boolean available,
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getAdminDoctors(search, specialization, available, pageable));
    }

    @PostMapping("/doctors")
    public ResponseEntity<DoctorListDTO> createDoctor(@RequestBody AdminDoctorRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createDoctor(request));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<DoctorListDTO> updateDoctor(@PathVariable UUID id, @RequestBody AdminDoctorRequestDTO request) {
        return ResponseEntity.ok(adminService.updateDoctor(id, request));
    }

    @PutMapping("/doctors/{id}/availability")
    public ResponseEntity<Void> toggleDoctorAvailability(@PathVariable UUID id) {
        adminService.toggleDoctorAvailability(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable UUID id) {
        try {
            adminService.deleteDoctor(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().startsWith("409")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            throw e;
        }
    }

    @GetMapping("/patients")
    public ResponseEntity<Page<PatientListDTO>> getAdminPatients(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getPatients(search, pageable));
    }

    @GetMapping("/patients/{id}/details")
    public ResponseEntity<PatientDetailDTO> getPatientDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getPatientDetails(id));
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable UUID id) {
        try {
            adminService.deletePatient(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().startsWith("409")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            throw e;
        }
    }

    // --- CONSULTATIONS ENDPOINTS ---
    
    @GetMapping("/consultations/stats")
    public ResponseEntity<Map<String, Long>> getConsultationStats() {
        return ResponseEntity.ok(adminService.getConsultationStats());
    }

    @GetMapping("/consultations")
    public ResponseEntity<Page<ConsultationAdminDTO>> getAdminConsultations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ConsultationStatus status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getAdminConsultations(search, status, dateFrom, dateTo, pageable));
    }

    // --- ORDERS ENDPOINTS ---
    
    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponseDTO>> getAdminOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }
}

