package com.altruist.controller;

import com.altruist.dto.DoctorDashboardDTO;
import com.altruist.dto.DoctorDetailDTO;
import com.altruist.dto.DoctorListDTO;
import com.altruist.model.User;
import com.altruist.service.DoctorService;
import com.altruist.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final ConsultationService consultationService;

    /**
     * Public endpoint — returns paginated list of available doctors.
     */
    @GetMapping("/available")
    public ResponseEntity<Page<DoctorListDTO>> getAvailableDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Double minFee,
            @RequestParam(required = false) Double maxFee
    ) {
        return ResponseEntity.ok(doctorService.findAvailableDoctors(page, size, specialization, minFee, maxFee));
    }

    /**
     * Public endpoint — returns full doctor profile by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DoctorDetailDTO> getDoctorById(@PathVariable UUID id) {
        return ResponseEntity.ok(doctorService.findDoctorById(id));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorDashboardDTO> getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(doctorService.getDashboardData(user.getId()));
    }

    @GetMapping("/reschedule-requests")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<com.altruist.dto.ConsultationResponseDTO>> getRescheduleRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(consultationService.getDoctorRescheduleRequests(user));
    }

    @GetMapping("/instant-queue")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorDashboardDTO.ConsultationItemDTO>> getInstantQueue() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(doctorService.getInstantQueue(user.getId()));
    }

    @PostMapping("/accept-instant/{consultationId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> acceptInstant(@PathVariable UUID consultationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        try {
            return ResponseEntity.ok(doctorService.acceptInstantConsultation(user.getId(), consultationId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Authenticated endpoint — toggles availability for the logged-in doctor.
     */
    @PutMapping("/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateAvailability(@RequestBody Map<String, Boolean> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        Boolean isAvailable = request.get("isAvailable");
        if (isAvailable == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            doctorService.updateAvailability(user.getId(), isAvailable);
            return ResponseEntity.ok(Map.of(
                "isAvailable", isAvailable,
                "message", "You are now " + (isAvailable ? "available" : "unavailable") + " for consultations"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/earnings")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<com.altruist.dto.DoctorEarningsDTO> getEarnings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(doctorService.getDoctorEarnings(user.getId()));
    }

    @GetMapping("/schedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> getSchedule() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(doctorService.getDoctorSchedule(user.getId()));
    }

    @PostMapping("/schedule/set-hours")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> setWeeklyHours(@RequestBody Map<String, Object> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }
        User user = (User) authentication.getPrincipal();
        try {
            String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(request);
            doctorService.setWeeklyHours(user.getId(), json);
            return ResponseEntity.ok(Map.of("message", "Schedule updated successfully", "schedule", json));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", filterError(e)));
        }
    }

    private String filterError(Exception e) {
         return e != null ? e.getMessage() : "Unknown error";
    }
}
