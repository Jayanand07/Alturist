package com.altruist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "support_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupportMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private String senderRole;

    private Boolean isRead = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
