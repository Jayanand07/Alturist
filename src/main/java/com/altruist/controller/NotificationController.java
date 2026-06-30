package com.altruist.controller;

import com.altruist.dto.NotificationDTO;
import com.altruist.model.User;
import com.altruist.service.NotificationService;
import com.altruist.service.StreamTicketRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Handles notification retrieval and SSE streaming.
 *
 * The ticket map and eviction scheduler have been moved to {@link StreamTicketRegistry}
 * so that the @Scheduled thread (which has no SecurityContext) does not trigger the
 * class-level @PreAuthorize interceptor and cause
 * AuthenticationCredentialsNotFoundException.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;
    private final StreamTicketRegistry ticketRegistry;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCountForUser(user.getId())));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable UUID id) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(notificationService.markAsRead(user.getId(), id));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        User user = getAuthenticatedUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable UUID id) {
        User user = getAuthenticatedUser();
        notificationService.deleteNotification(user.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
    }

    @PostMapping("/stream-ticket")
    public ResponseEntity<Map<String, String>> createStreamTicket() {
        User user = getAuthenticatedUser();
        UUID ticket = ticketRegistry.issue(user.getId());
        return ResponseEntity.ok(Map.of("ticket", ticket.toString()));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam("ticket") String ticketStr) {
        StreamTicketRegistry.TicketEntry entry = ticketRegistry.consume(ticketStr);
        if (entry == null) {
            throw new SecurityException("Stream ticket expired or invalid");
        }
        UUID userId = entry.userId();
        SseEmitter emitter = notificationService.subscribe(userId, 30L * 60L * 1000L);
        try {
            long unread = notificationService.getUnreadCountForUser(userId);
            emitter.send(SseEmitter.event().name("unread").data(String.valueOf(unread)));
        } catch (Exception ignored) {
        }
        return emitter;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            throw new SecurityException("User not authenticated");
        }
        return (User) auth.getPrincipal();
    }
}
