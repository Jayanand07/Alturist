package com.altruist.event;

import com.altruist.dto.NotificationDTO;
import com.altruist.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Delivers order SSE notifications strictly AFTER the originating DB transaction commits.
 *
 * Using AFTER_COMMIT prevents the race condition where a connected SSE client
 * could receive a notification event before the updated Order row is visible
 * to other readers (which would happen if publish() were called inside the
 * original @Transactional boundary).
 *
 * notificationService.createNotification() is itself @Transactional, so it
 * opens a fresh transaction once the original one is done — correct behaviour.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final NotificationService notificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderNotification(OrderNotificationEvent event) {
        try {
            NotificationDTO notification = notificationService.createNotification(
                    event.getUserId(),
                    event.getTitle(),
                    event.getMessage(),
                    event.getType()
            );
            notificationService.publish(event.getUserId(), notification);
            log.debug("Delivered {} notification for order {} to user {}",
                    event.getType(), event.getOrderId(), event.getUserId());
        } catch (Exception e) {
            log.error("Failed to deliver {} notification for order {} to user {}",
                    event.getType(), event.getOrderId(), event.getUserId(), e);
        }
    }
}
