package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketDTO {
    private UUID id;
    private String subject;
    private String status;
    private String priority;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long unreadCount;
    private String patientName;
}
