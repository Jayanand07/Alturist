package com.altruist.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

/**
 * Published inside a @Transactional boundary when an order notification
 * needs to be sent to a patient. Consumed by {@link OrderEventListener},
 * which is annotated @TransactionalEventListener(phase = AFTER_COMMIT) so
 * the SSE push is guaranteed to happen only after the DB transaction commits.
 *
 * This eliminates the race condition where an SSE event could be delivered
 * to a connected client before the row is visible to other DB readers.
 */
@Getter
public class OrderNotificationEvent extends ApplicationEvent {

    private final UUID userId;
    private final UUID orderId;
    private final String title;
    private final String message;
    private final String type;

    public OrderNotificationEvent(Object source, UUID userId, UUID orderId,
                                   String title, String message, String type) {
        super(source);
        this.userId  = userId;
        this.orderId = orderId;
        this.title   = title;
        this.message = message;
        this.type    = type;
    }
}
