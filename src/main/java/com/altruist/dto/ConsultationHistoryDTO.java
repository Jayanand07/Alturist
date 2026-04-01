package com.altruist.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConsultationHistoryDTO {
    private String id;
    private String doctorName;
    private String specialization;
    private String profilePicture;
    private String scheduledAt;
    private String status;
    private String type;
    private String amount;
}
