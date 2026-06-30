package com.altruist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User patient;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String items; // JSON representation of the ordered items

    @Column(nullable = false)
    private BigDecimal totalAmount;

    /**
     * Optimistic locking version. Prevents concurrent admin status updates
     * from silently overwriting each other (last-write-wins). Any concurrent
     * update that sees a stale version triggers OptimisticLockException → 409.
     */
    @Version
    private Long version;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private String prescriptionUrl;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // e.g. "COD" or "ONLINE"

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
