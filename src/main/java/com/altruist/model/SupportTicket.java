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
    name = "support_tickets",
    indexes = {
        @Index(name = "idx_ticket_patient", columnList = "patient_id"),
        @Index(name = "idx_ticket_status",  columnList = "status")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User patient;

    @Column(nullable = false)
    private String subject;

    private String status;

    private String priority;

    private String category;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
