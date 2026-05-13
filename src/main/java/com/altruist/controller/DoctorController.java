package com.altruist.controller;

import com.altruist.dto.DoctorDashboardDTO;
import com.altruist.dto.DoctorDetailDTO;
import com.altruist.dto.DoctorListDTO;
import com.altruist.model.User;
import com.altruist.model.UserType;
import com.altruist.service.DoctorService;
import com.altruist.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

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
    public ResponseEntity<?> getAvailableDoctors(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) Boolean available
    ) {
        return ResponseEntity.ok(doctorService.getDoctors(city, specialization, sortBy, available));
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCities() {
        return ResponseEntity.ok(doctorService.getAvailableCities());
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
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(doctorService.getDashboardData(user.getId()));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorDetailDTO> getOwnProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(doctorService.getOwnProfile(user.getId()));
    }

    @PatchMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorDetailDTO> updateOwnProfile(@RequestBody DoctorDetailDTO dto) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(doctorService.updateOwnProfile(user.getId(), dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Page<com.altruist.dto.DoctorListDTO>> getAllDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(doctorService.getAllAdminDoctors(search, specialization, available, pageable));
    }

    /**
     * Update doctor info.
     * ADMIN can update any doctor.
     * DOCTOR can only update their own record.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<com.altruist.dto.DoctorListDTO> updateDoctor(
            @PathVariable UUID id,
            @Valid @RequestBody com.altruist.dto.AdminDoctorRequestDTO request) {
        User user = getAuthenticatedUser();
        // Security: DOCTOR role can only update their own profile
        if (user.getUserType() == UserType.DOCTOR && !user.getId().equals(id)) {
            throw new AccessDeniedException("You can only update your own profile");
        }
        return ResponseEntity.ok(doctorService.updateDoctorInfo(id, request));
    }

    /**
     * Delete a doctor.
     * Only ADMIN can delete — DOCTOR role cannot delete any doctor account.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable UUID id) {
        doctorService.deleteDoctorEntity(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reschedule-requests")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<com.altruist.dto.ConsultationResponseDTO>> getRescheduleRequests() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(consultationService.getDoctorRescheduleRequests(user));
    }

    @GetMapping("/instant-queue")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorDashboardDTO.ConsultationItemDTO>> getInstantQueue() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(doctorService.getInstantQueue(user.getId()));
    }

    @PostMapping("/accept-instant/{consultationId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> acceptInstant(@PathVariable UUID consultationId) {
        User user = getAuthenticatedUser();
        try {
            return ResponseEntity.ok(doctorService.acceptInstantConsultation(user.getId(), consultationId));
        } catch (RuntimeException e) {
            // Return a safe, non-leaking error message
            return ResponseEntity.badRequest().body(Map.of("error", "Unable to accept consultation at this time"));
        }
    }

    /**
     * Toggle availability for the logged-in doctor.
     */
    @PutMapping("/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateAvailability(@RequestBody Map<String, Boolean> request) {
        User user = getAuthenticatedUser();
        Boolean isAvailable = request.get("isAvailable");
        if (isAvailable == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "isAvailable field is required"));
        }

        try {
            doctorService.updateAvailability(user.getId(), isAvailable);
            return ResponseEntity.ok(Map.of(
                "isAvailable", isAvailable,
                "message", "You are now " + (isAvailable ? "available" : "unavailable") + " for consultations"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unable to update availability"));
        }
    }

    @GetMapping("/earnings")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<com.altruist.dto.DoctorEarningsDTO> getEarnings() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(doctorService.getDoctorEarnings(user.getId()));
    }

    @GetMapping("/schedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> getSchedule() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(doctorService.getDoctorSchedule(user.getId()));
    }

    @PostMapping("/schedule/set-hours")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> setWeeklyHours(@RequestBody Map<String, Object> request) {
        User user = getAuthenticatedUser();
        try {
            String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(request);
            doctorService.setWeeklyHours(user.getId(), json);
            return ResponseEntity.ok(Map.of("message", "Schedule updated successfully", "schedule", json));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update schedule"));
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            throw new SecurityException("User not authenticated");
        }
        return (User) auth.getPrincipal();
    }
}
