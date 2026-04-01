package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequestDTO {

    private UUID consultationId;
    private String diagnosis;
    private List<MedicineDTO> medicines;
    private List<String> diagnosticTests;
    private LocalDate followUpDate;
    private LocalDate validUntil;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineDTO {
        private String name;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}
