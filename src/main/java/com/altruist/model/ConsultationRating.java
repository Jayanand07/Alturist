package com.altruist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.util.UUID;

@Entity
@Table(name = "consultation_ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationRating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Consultation consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Doctor doctor;

    @Column(nullable = false)
    private Integer rating; // 1-5

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @CreationTimestamp
    @Column(updatable = false)
    private java.time.LocalDateTime createdAt;
}
