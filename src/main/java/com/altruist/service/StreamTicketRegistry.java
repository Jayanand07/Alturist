package com.altruist.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Holds the short-lived one-time SSE stream tickets.
 *
 * Keeping this in a plain @Component (no @PreAuthorize on the class) prevents
 * Spring Security's method interceptor from firing on the @Scheduled eviction
 * thread, which has no SecurityContext. Previously, the scheduler lived inside
 * NotificationController which carries a class-level @PreAuthorize("isAuthenticated()"),
 * causing AuthenticationCredentialsNotFoundException every 60 s.
 */
@Component
public class StreamTicketRegistry {

    public record TicketEntry(UUID userId, long expiresAt) {}

    private final ConcurrentHashMap<UUID, TicketEntry> tickets = new ConcurrentHashMap<>();

    /** Issues a one-time ticket that expires after 60 seconds. */
    public UUID issue(UUID userId) {
        UUID ticket = UUID.randomUUID();
        tickets.put(ticket, new TicketEntry(userId, System.currentTimeMillis() + 60_000L));
        return ticket;
    }

    /**
     * Validates and consumes a ticket (one-time use).
     *
     * @return the TicketEntry if valid and not expired, or {@code null} otherwise.
     */
    public TicketEntry consume(String ticketStr) {
        UUID ticket;
        try {
            ticket = UUID.fromString(ticketStr);
        } catch (IllegalArgumentException e) {
            return null;
        }
        TicketEntry entry = tickets.remove(ticket);
        if (entry == null || entry.expiresAt() < System.currentTimeMillis()) {
            return null;
        }
        return entry;
    }

    /**
     * Runs in a background scheduler thread — no SecurityContext required.
     * Because this class carries no @PreAuthorize annotation, Spring Security's
     * method interceptor is never invoked.
     */
    @Scheduled(fixedRate = 60_000)
    public void evictExpiredTickets() {
        long now = System.currentTimeMillis();
        tickets.entrySet().removeIf(e -> e.getValue().expiresAt() < now);
    }
}
