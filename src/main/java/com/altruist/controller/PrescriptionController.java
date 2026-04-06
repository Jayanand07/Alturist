package com.altruist.controller;

import com.altruist.dto.PrescriptionRequestDTO;
import com.altruist.dto.PrescriptionResponseDTO;
import com.altruist.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    /**
     * Creates a new prescription and completes the consultation.
     * Only the DOCTOR role can call this.
     */
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponseDTO> createPrescription(@Valid @RequestBody PrescriptionRequestDTO request) {
        PrescriptionResponseDTO response = prescriptionService.createPrescription(request);
        return ResponseEntity.ok(response);
    }
}
