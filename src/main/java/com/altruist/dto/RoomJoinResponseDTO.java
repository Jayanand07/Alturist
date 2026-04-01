package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomJoinResponseDTO {
    private String roomName;
    private String displayName;
    private String userRole;     // "doctor" or "patient"
    private String jitsiDomain;
    private String consultationStatus;
}
