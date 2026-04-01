package com.altruist.dto;

import com.altruist.model.Consultation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationSummaryDTO {
    private UUID id;
    private String doctorName;
    private String doctorSpecialization;
    private String doctorProfileUrl;
    private LocalDateTime scheduledAt;
    private String status;
    private String type;
    private String videoRoomId;

    public static ConsultationSummaryDTO fromEntity(Consultation consultation) {
        if (consultation == null) return null;
        
        String doctorName = "Unknown Doctor";
        String doctorSpecialization = "N/A";
        String doctorProfileUrl = null;
        
        if (consultation.getDoctor() != null && consultation.getDoctor().getUser() != null) {
            doctorName = consultation.getDoctor().getUser().getFullName();
            doctorSpecialization = consultation.getDoctor().getSpecialization();
            doctorProfileUrl = consultation.getDoctor().getUser().getProfilePictureUrl();
        }
        
        return ConsultationSummaryDTO.builder()
                .id(consultation.getId())
                .doctorName(doctorName)
                .doctorSpecialization(doctorSpecialization)
                .doctorProfileUrl(doctorProfileUrl)
                .scheduledAt(consultation.getScheduledAt())
                .status(consultation.getStatus() != null ? consultation.getStatus().name() : null)
                .type(consultation.getConsultationType() != null ? consultation.getConsultationType().name() : null)
                .videoRoomId(consultation.getVideoRoomId())
                .build();
    }
}
