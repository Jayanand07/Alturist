package com.altruist.controller;

import com.altruist.dto.CompleteConsultationRequestDTO;
import com.altruist.dto.ConsultationResponseDTO;
import com.altruist.dto.InstantBookingRequestDTO;
import com.altruist.dto.RoomJoinResponseDTO;
import com.altruist.model.User;
import com.altruist.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    /**
     * Book an instant consultation.
     * Only PATIENT role can book.
     */
    @PostMapping("/instant")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ConsultationResponseDTO> bookInstant(@Valid @RequestBody InstantBookingRequestDTO request) {
        User patient = getAuthenticatedUser();
        ConsultationResponseDTO response = consultationService.bookInstantConsultation(patient, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Join the video room for a consultation.
     * Both PATIENT and DOCTOR can join (ownership verified in service).
     * Transitions the consultation from PENDING → ONGOING on first join.
     */
    @PostMapping("/{consultationId}/room/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoomJoinResponseDTO> joinRoom(@PathVariable UUID consultationId) {
        User user = getAuthenticatedUser();
        RoomJoinResponseDTO response = consultationService.joinRoom(user, consultationId);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete a consultation with diagnosis and prescription data.
     * Only the DOCTOR assigned to this consultation can complete it.
     */
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ConsultationResponseDTO> completeConsultation(
            @PathVariable UUID id,
            @Valid @RequestBody CompleteConsultationRequestDTO request
    ) {
        User doctor = getAuthenticatedUser();
        ConsultationResponseDTO response = consultationService.completeConsultation(doctor, id, request);
        return ResponseEntity.ok(response);
    }

    // ── Reschedule & Cancel Additions ───────────────────────────────────────

    @PostMapping("/{id}/reschedule-request")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ConsultationResponseDTO> requestReschedule(
            @PathVariable UUID id,
            @Valid @RequestBody com.altruist.dto.RescheduleRequestDTO request
    ) {
        User patient = getAuthenticatedUser();
        return ResponseEntity.ok(consultationService.requestReschedule(patient, id, request));
    }

    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Void> cancelConsultation(@PathVariable UUID id) {
        User patient = getAuthenticatedUser();
        consultationService.cancelConsultation(patient, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<java.util.List<ConsultationResponseDTO>> getMyConsultations() {
        User patient = getAuthenticatedUser();
        return ResponseEntity.ok(consultationService.getMyConsultations(patient));
    }

    @PutMapping("/{id}/approve-reschedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ConsultationResponseDTO> approveReschedule(@PathVariable UUID id) {
        User doctor = getAuthenticatedUser();
        return ResponseEntity.ok(consultationService.approveReschedule(doctor, id));
    }

    @PutMapping("/{id}/decline-reschedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ConsultationResponseDTO> declineReschedule(@PathVariable UUID id) {
        User doctor = getAuthenticatedUser();
        return ResponseEntity.ok(consultationService.declineReschedule(doctor, id));
    }

    // ── Getters ─────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConsultationResponseDTO> getConsultation(@PathVariable UUID id) {
        User user = getAuthenticatedUser();
        ConsultationResponseDTO response = consultationService.getConsultationById(user, id);
        return ResponseEntity.ok(response);
    }

    // ── Supabase Custom JWT Generator ──────────────────────────────────────────
    @GetMapping("/supabase-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.Map<String, String>> getSupabaseToken() {
        User user = getAuthenticatedUser();
        try {
            String jwtSecret = System.getenv("SUPABASE_JWT_SECRET");
            if (jwtSecret == null || jwtSecret.isBlank()) {
                throw new RuntimeException("SUPABASE_JWT_SECRET is not configured on the server.");
            }

            // Create JWT Header
            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String headerB64 = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            // Create Custom Payload syncing Firebase UID to Supabase RLS
            long iat = System.currentTimeMillis() / 1000;
            long exp = iat + 3600; // 1 hour expiration
            // SECURITY: Sanitize firebaseUid to prevent JSON injection in JWT payload
            String safeUid = user.getFirebaseUid().replace("\\", "\\\\").replace("\"", "\\\"");
            String payloadJson = String.format("{\"role\":\"authenticated\",\"firebase_uid\":\"%s\",\"iat\":%d,\"exp\":%d}", safeUid, iat, exp);
            String payloadB64 = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            // Sign using HMAC SHA256
            String signatureTarget = headerB64 + "." + payloadB64;
            javax.crypto.Mac sha256_HMAC = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secret_key = new javax.crypto.spec.SecretKeySpec(jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            String signatureB64 = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(sha256_HMAC.doFinal(signatureTarget.getBytes(java.nio.charset.StandardCharsets.UTF_8)));

            String token = signatureTarget + "." + signatureB64;
            return ResponseEntity.ok(java.util.Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Failed to generate Supabase token"));
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
