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
    name = "lab_packages",
    indexes = {
        @Index(name = "idx_labpackage_isActive", columnList = "isActive")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer includesTestCount;

    @Column(name = "test_names", columnDefinition = "text[]")
    private String[] testNames;

    private BigDecimal originalPrice;

    private BigDecimal discountedPrice;

    private Integer discountPercent;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private Boolean smartReportIncluded = false;

    @Builder.Default
    @Column(columnDefinition = "boolean default true")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
