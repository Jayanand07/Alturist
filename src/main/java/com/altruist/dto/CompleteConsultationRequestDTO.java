package com.altruist.dto;

import lombok.Data;

@Data
public class CompleteConsultationRequestDTO {
    private String diagnosis;
    private String prescriptionData; // JSON string: { medicines: [], tests: [], notes: "" }
    private Integer callDurationMinutes; // Optional — tracked from frontend timer
}
