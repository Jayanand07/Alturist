package com.altruist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "doctor_vlogs",
    indexes = {
        @Index(name = "idx_vlog_doctor",    columnList = "doctor_id"),
        @Index(name = "idx_vlog_published", columnList = "isPublished"),
        @Index(name = "idx_vlog_category",  columnList = "category")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorVlog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Doctor doctor;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String videoUrl;

    private String thumbnailUrl;

    private String category;

    private Boolean isPublished = false;

    private Integer viewCount = 0;

    private LocalDateTime publishedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
