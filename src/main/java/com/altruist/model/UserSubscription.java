package com.altruist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "user_subscriptions",
    indexes = {
        @Index(name = "idx_subscription_user",        columnList = "user_id"),
        @Index(name = "idx_subscription_status",      columnList = "status"),
        @Index(name = "idx_subscription_user_status", columnList = "user_id, status")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    private String billingCycle;

    private String status;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate nextBillingDate;

    private Integer consultationsUsed = 0;

    private Integer consultationsRemaining;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
