package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketRequestDTO {
    private String subject;
    private String category;
    private String priority;
    private String firstMessage;
}
