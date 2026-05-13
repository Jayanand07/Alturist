package com.altruist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "doctors",
    indexes = {
        @Index(name = "idx_doctor_city",          columnList = "city"),
        @Index(name = "idx_doctor_specialization", columnList = "specialization"),
        @Index(name = "idx_doctor_is_verified",    columnList = "isVerified"),
        @Index(name = "idx_doctor_city_spec",      columnList = "city, specialization")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Optimistic locking version — JPA increments this on every UPDATE.
     * Prevents stale writes: if two threads read the same row and both try
     * to write, the second will get an OptimisticLockException.
     * Works as a safety net alongside the atomicSetUnavailable query.
     */
    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User user;

    private String specialization;

    @Column(unique = true, nullable = false)
    private String medicalLicense;

    private String qualification;

    private Integer experienceYears;

    private BigDecimal consultationFee;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Column(nullable = false)
    private Double rating = 0.0;

    @Column(nullable = false)
    private Integer totalConsultations = 0;

    @Column(columnDefinition = "TEXT")
    private String scheduleJson;

    @Column(nullable = true)
    private String city;

    @Column(nullable = true)
    private String clinicName;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String clinicAddress;

    @Column(nullable = true)
    private String clinicPhone;

    @Column(nullable = true)
    private Double latitude;

    @Column(nullable = true)
    private Double longitude;

    @Column(nullable = true)
    private Boolean isVerified = false;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String bio;

    @Column(nullable = true)
    private String languages;

    @Column(nullable = true)
    private String profilePictureUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
