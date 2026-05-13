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
    name = "medicines",
    indexes = {
        @Index(name = "idx_medicine_name",     columnList = "name"),
        @Index(name = "idx_medicine_category", columnList = "category"),
        @Index(name = "idx_medicine_in_stock", columnList = "inStock")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String genericName;

    private String manufacturer;

    private String category;

    private BigDecimal price;

    private BigDecimal discountedPrice;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private Boolean requiresPrescription = false;

    @Builder.Default
    @Column(columnDefinition = "boolean default true")
    private Boolean inStock = true;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer stockQuantity = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
