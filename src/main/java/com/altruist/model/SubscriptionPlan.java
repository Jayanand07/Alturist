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
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal monthlyPrice;

    @Column(nullable = false)
    private BigDecimal yearlyPrice;

    @Column(nullable = false)
    private Integer consultationsPerMonth;

    private Boolean labDiscountEnabled = false;

    private Integer labDiscountPercent = 0;

    private Boolean medicineDiscountEnabled = false;

    private Integer medicineDiscountPercent = 0;

    private Boolean prioritySupport = false;

    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
