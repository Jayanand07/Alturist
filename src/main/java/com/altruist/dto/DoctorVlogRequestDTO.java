package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorVlogRequestDTO {
    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;
    private String category;
}
