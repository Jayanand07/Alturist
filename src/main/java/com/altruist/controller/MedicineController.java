package com.altruist.controller;

import com.altruist.dto.MedicineBulkResultDTO;
import com.altruist.dto.MedicineDTO;
import com.altruist.dto.MedicineResponseDTO;
import com.altruist.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/api/admin/medicines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<MedicineResponseDTO>> getAdminMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean prescription,
            @RequestParam(required = false) Boolean inStock,
            Pageable pageable) {
        return ResponseEntity.ok(medicineService.getMedicines(search, category, prescription, inStock, pageable));
    }

    @GetMapping("/api/admin/medicines/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getMedicineStats() {
        return ResponseEntity.ok(Map.of(
                "totalCount", medicineService.getTotalMedicines(),
                "inStockCount", medicineService.getInStockCount(),
                "requiresPrescriptionCount", medicineService.getRequiresPrescriptionCount()
        ));
    }

    @PostMapping("/api/admin/medicines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineResponseDTO> createMedicine(@Valid @RequestBody MedicineDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.createMedicine(dto));
    }

    @PostMapping("/api/admin/medicines/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineBulkResultDTO> bulkCreateMedicines(@RequestBody List<MedicineDTO> dtoList) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.bulkCreate(dtoList));
    }

    @PutMapping("/api/admin/medicines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineResponseDTO> updateMedicine(@PathVariable UUID id, @Valid @RequestBody MedicineDTO dto) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, dto));
    }

    @PatchMapping("/api/admin/medicines/{id}/toggle-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleStock(@PathVariable UUID id) {
        medicineService.toggleStock(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/admin/medicines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedicine(@PathVariable UUID id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }


    // --- PUBLIC ENDPOINTS (Patient Facing) ---

    @GetMapping("/api/medicines")
    public ResponseEntity<?> getPublicMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean prescription,
            Pageable pageable) {
        // Force inStock = true for public queries
        Page<MedicineResponseDTO> result = medicineService.getMedicines(search, category, prescription, true, pageable);
        return ResponseEntity.ok(result);
    }
}
