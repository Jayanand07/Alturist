package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorVlogRequestDTO {
    @NotBlank(message = "Title is required")
    @Size(max = 180, message = "Title is too long")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description is too long")
    private String description;

    @NotBlank(message = "Video URL is required")
    @Size(max = 2048, message = "Video URL is too long")
    private String videoUrl;

    @Size(max = 2048, message = "Thumbnail URL is too long")
    private String thumbnailUrl;

    @NotBlank(message = "Category is required")
    @Size(max = 120, message = "Category is too long")
    private String category;
}
