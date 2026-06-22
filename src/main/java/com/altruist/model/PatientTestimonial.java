package com.altruist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patient_testimonials")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientTestimonial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String patientName;

    private String city;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reviewText;

    private Integer rating;

    private String tag;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private Boolean isFeatured = false;

    @Builder.Default
    @Column(columnDefinition = "boolean default true")
    private Boolean isApproved = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
