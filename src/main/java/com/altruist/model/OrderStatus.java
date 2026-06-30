package com.altruist.model;

/**
 * Valid order status values and the allowed state-machine transitions.
 *
 * Allowed transitions:
 *   PENDING   → CONFIRMED, CANCELLED
 *   CONFIRMED → SHIPPED,   CANCELLED
 *   SHIPPED   → DELIVERED
 *   DELIVERED → (terminal)
 *   CANCELLED → (terminal)
 *
 * NOTE — Future gap: SHIPPED → CANCELLED is intentionally blocked.
 * A future RETURNED status will be needed to handle refused/returned shipments;
 * that is a separate feature and is not implemented here.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
