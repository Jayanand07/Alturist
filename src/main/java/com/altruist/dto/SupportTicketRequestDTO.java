package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketRequestDTO {
    @NotBlank(message = "Subject is required")
    @Size(max = 160, message = "Subject is too long")
    private String subject;

    @NotBlank(message = "Category is required")
    @Size(max = 80, message = "Category is too long")
    private String category;

    @NotBlank(message = "Priority is required")
    @Size(max = 40, message = "Priority is too long")
    private String priority;

    @NotBlank(message = "Message is required")
    @Size(max = 4000, message = "Message is too long")
    private String firstMessage;
}
