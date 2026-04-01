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
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
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

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
