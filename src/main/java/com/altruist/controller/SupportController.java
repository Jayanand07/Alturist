package com.altruist.controller;

import com.altruist.dto.SupportTicketRequestDTO;
import com.altruist.model.User;
import com.altruist.service.SupportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    // --- Patient Endpoints ---

    @PostMapping("/support/tickets")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> createTicket(@AuthenticationPrincipal User user, @RequestBody SupportTicketRequestDTO dto) {
        try {
            return ResponseEntity.ok(supportService.createTicket(user, dto));
        } catch (Exception e) {
            log.warn("Failed to create ticket for user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to create support ticket."));
        }
    }

    @GetMapping("/support/tickets")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getMyTickets(@AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(supportService.getPatientTickets(user));
        } catch (Exception e) {
            log.warn("Failed to fetch tickets for user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to fetch tickets."));
        }
    }

    @GetMapping("/support/tickets/{ticketId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getTicket(@AuthenticationPrincipal User user, @PathVariable UUID ticketId) {
        try {
            return ResponseEntity.ok(supportService.getTicketById(ticketId, user));
        } catch (Exception e) {
            log.warn("Failed to fetch ticket {}: {}", ticketId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Ticket not found."));
        }
    }

    @GetMapping("/support/tickets/{ticketId}/messages")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getMessages(@AuthenticationPrincipal User user, @PathVariable UUID ticketId) {
        try {
            return ResponseEntity.ok(supportService.getMessages(ticketId, user));
        } catch (Exception e) {
            log.warn("Failed to fetch messages for ticket {}: {}", ticketId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to fetch messages."));
        }
    }

    @PostMapping("/support/tickets/{ticketId}/messages")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> sendMessage(@AuthenticationPrincipal User user, @PathVariable UUID ticketId, @RequestBody SendMessageRequest req) {
        try {
            return ResponseEntity.ok(supportService.sendMessage(ticketId, user, req.getMessage()));
        } catch (Exception e) {
            log.warn("Failed to send message on ticket {}: {}", ticketId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to send message."));
        }
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/support/tickets")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> adminGetAllTickets(@RequestParam(required = false) String status) {
        try {
            return ResponseEntity.ok(supportService.adminGetAllTickets(status));
        } catch (Exception e) {
            log.error("Admin failed to fetch all tickets: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to fetch tickets."));
        }
    }

    @PatchMapping("/admin/support/tickets/{ticketId}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateTicketStatus(@AuthenticationPrincipal User admin, @PathVariable UUID ticketId, @RequestBody UpdateStatusRequest req) {
        try {
            supportService.updateTicketStatus(ticketId, req.getStatus(), admin);
            return ResponseEntity.ok(Map.of("message", "Ticket status updated"));
        } catch (Exception e) {
            log.warn("Admin failed to update ticket {} status: {}", ticketId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to update ticket status."));
        }
    }

    @Data
    public static class SendMessageRequest {
        private String message;
    }

    @Data
    public static class UpdateStatusRequest {
        private String status;
    }
}
