package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDTO {

    private UUID id;
    private UUID consultationId;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private List<PrescriptionRequestDTO.MedicineDTO> medicines;
    private List<String> diagnosticTests;
    private LocalDate validUntil;
    private LocalDate followUpDate;
    private LocalDateTime createdAt;
}
