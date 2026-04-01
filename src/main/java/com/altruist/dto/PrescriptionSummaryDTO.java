package com.altruist.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrescriptionSummaryDTO {
    private String id; // Use consultingId to easily fetch details
    private String doctorName;
    private String dateIssued;
    private String medicinesCount;
}
