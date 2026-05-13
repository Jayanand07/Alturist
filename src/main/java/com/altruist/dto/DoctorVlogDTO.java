package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorVlogDTO {
    private UUID id;
    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;
    private String category;
    private Boolean isPublished;
    private Integer viewCount;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String doctorName;
    private String doctorSpecialization;
    private String doctorCity;
}
