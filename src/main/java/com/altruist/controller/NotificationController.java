package com.altruist.controller;

import com.altruist.dto.NotificationDTO;
import com.altruist.model.User;
import com.altruist.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

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

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            throw new SecurityException("User not authenticated");
        }
        return (User) auth.getPrincipal();
    }
}
