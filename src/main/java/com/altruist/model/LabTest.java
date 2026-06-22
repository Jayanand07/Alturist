package com.altruist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "lab_tests",
    indexes = {
        @Index(name = "idx_labtest_category", columnList = "category"),
        @Index(name = "idx_labtest_is_featured", columnList = "isFeatured"),
        @Index(name = "idx_labtest_is_active", columnList = "isActive")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    private BigDecimal price; // Original Price

    private BigDecimal discountedPrice; // Final Selling Price

    private Integer discountPercent;

    private Integer includesCount;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private Boolean isFeatured = false;

    @Builder.Default
    @Column(columnDefinition = "boolean default true")
    private Boolean isActive = true;

    @Column(name = "parameters_included", columnDefinition = "text[]")
    private String[] parametersIncluded;

    private Integer reportTimeHours;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private Boolean freeHomeCollection = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
