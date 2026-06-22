package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VlogRequestDTO {
    @NotBlank(message = "Title is required")
    @Size(max = 180, message = "Title is too long")
    private String title;

    @Size(max = 200, message = "Excerpt is too long (max 200 characters)")
    private String excerpt;

    @NotBlank(message = "Content is required")
    private String content;

    @Size(max = 2048, message = "Video URL is too long")
    private String videoUrl;

    @Size(max = 2048, message = "Thumbnail URL is too long")
    private String thumbnailUrl;

    @NotBlank(message = "Category is required")
    @Size(max = 120, message = "Category is too long")
    private String category;

    private Boolean isPublished = false;
    private Boolean isFeatured = false;
    
    private UUID authorDoctorId;
}
