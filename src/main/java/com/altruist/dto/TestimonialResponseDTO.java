package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialResponseDTO {
    private UUID id;
    private String user;
    private String location;
    private String text;
    private Integer rating;
    private String tag;
}
