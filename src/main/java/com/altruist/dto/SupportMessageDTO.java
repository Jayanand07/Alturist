package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupportMessageDTO {
    private UUID id;
    private String message;
    private String senderRole;
    private String senderName;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
