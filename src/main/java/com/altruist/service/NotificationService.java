package com.altruist.service;

import com.altruist.dto.NotificationDTO;
import com.altruist.model.Notification;
import com.altruist.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<UUID, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCountForUser(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationDTO createNotification(UUID userId, String title, String message, String type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        log.info("Created notification for user {}: {}", userId, title);
        return toDTO(saved);
    }

    @Transactional
    public NotificationDTO markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to notification");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return toDTO(saved);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.getIsRead())
                .collect(Collectors.toList());
        
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
        log.info("Marked all notifications as read for user {}", userId);
    }

    @Transactional
    public void deleteNotification(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to notification");
        }

        notificationRepository.delete(notification);
        log.info("Deleted notification {}", notificationId);
    }

    private NotificationDTO toDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .type(notification.getType())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public SseEmitter subscribe(UUID userId, long timeoutMs) {
        SseEmitter emitter = new SseEmitter(timeoutMs);
        Set<SseEmitter> userEmitters = emitters.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>());
        userEmitters.add(emitter);

        Runnable cleanup = () -> {
            Set<SseEmitter> set = emitters.get(userId);
            if (set != null) {
                set.remove(emitter);
                if (set.isEmpty()) {
                    emitters.remove(userId, set);
                }
            }
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(t -> cleanup.run());

        log.info("SSE subscribed for user {} (active={})", userId, userEmitters.size());
        return emitter;
    }

    public void publish(UUID userId, NotificationDTO dto) {
        Set<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return;
        }
        String payload;
        try {
            payload = objectMapper.writeValueAsString(dto);
        } catch (Exception e) {
            log.error("Failed to serialize notification for SSE publish to user {}", userId, e);
            return;
        }
        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(payload));
            } catch (IllegalStateException | IOException e) {
                log.debug("Removing dead SSE emitter for user {}: {}", userId, e.getMessage());
                tryComplete(emitter);
                Set<SseEmitter> set = emitters.get(userId);
                if (set != null) {
                    set.remove(emitter);
                }
            }
        }
    }

    public void publishUnread(UUID userId, long count) {
        Set<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return;
        }
        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().name("unread").data(String.valueOf(count)));
            } catch (IllegalStateException | IOException e) {
                log.debug("Removing dead SSE emitter for user {}: {}", userId, e.getMessage());
                tryComplete(emitter);
                Set<SseEmitter> set = emitters.get(userId);
                if (set != null) {
                    set.remove(emitter);
                }
            }
        }
    }

    public void unsubscribe(UUID userId, SseEmitter emitter) {
        Set<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                emitters.remove(userId, userEmitters);
            }
        }
        tryComplete(emitter);
    }

    @Scheduled(fixedRate = 25000)
    public void heartbeat() {
        for (var entry : emitters.entrySet()) {
            UUID userId = entry.getKey();
            for (SseEmitter emitter : entry.getValue()) {
                try {
                    emitter.send(SseEmitter.event().comment("heartbeat"));
                } catch (IllegalStateException | IOException e) {
                    log.debug("Heartbeat: removing dead SSE emitter for user {}", userId);
                    tryComplete(emitter);
                    Set<SseEmitter> set = emitters.get(userId);
                    if (set != null) {
                        set.remove(emitter);
                    }
                }
            }
        }
    }

    private void tryComplete(SseEmitter emitter) {
        try {
            emitter.complete();
        } catch (IllegalStateException ignored) {
            // already completed
        }
    }
}
