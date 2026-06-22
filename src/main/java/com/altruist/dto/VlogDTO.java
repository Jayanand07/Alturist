package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VlogDTO {
    private UUID id;
    private String title;
    private String excerpt;
    private String content;
    private String videoUrl;
    private String thumbnailUrl;
    private String category;
    private Boolean isPublished;
    private Boolean isFeatured;
    private Integer viewsCount;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private UUID authorDoctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String doctorProfilePic;
    private String doctorCity;
}
