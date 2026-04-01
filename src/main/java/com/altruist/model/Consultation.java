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
@Table(name = "consultations", indexes = {
    @Index(name = "idx_patient_scheduled", columnList = "patient_id, scheduledAt"),
    @Index(name = "idx_doctor_scheduled_status", columnList = "doctor_id, scheduledAt, status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationType consultationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationStatus status = ConsultationStatus.PENDING;

    private String videoRoomId;

    private String prescriptionUrl;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(columnDefinition = "boolean default false")
    private Boolean isRescheduleRequested = false;

    private LocalDateTime proposedRescheduleTime;

    @Column(columnDefinition = "TEXT")
    private String rescheduleReason;

    private LocalDateTime callStartedAt;

    private LocalDateTime callEndedAt;

    private Integer callDurationMinutes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
