package com.altruist.controller;

import com.altruist.dto.SubscriptionPlanDTO;
import com.altruist.dto.UserSubscriptionDTO;
import com.altruist.model.User;
import com.altruist.service.SubscriptionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    // --- Public Endpoints ---

    @GetMapping("/subscriptions/plans")
    public ResponseEntity<List<SubscriptionPlanDTO>> getActivePlans() {
        try {
            return ResponseEntity.ok(subscriptionService.getAllActivePlans());
        } catch (Exception e) {
            log.error("Failed to fetch active plans", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Patient Endpoints ---

    @GetMapping("/subscriptions/my")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getMySubscription(@AuthenticationPrincipal User user) {
        try {
            UserSubscriptionDTO dto = subscriptionService.getCurrentSubscription(user);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.warn("Failed to fetch subscription for user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to fetch subscription."));
        }
    }

    @PostMapping("/subscriptions/subscribe")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> subscribe(@AuthenticationPrincipal User user, @RequestBody SubscribeRequest req) {
        try {
            UserSubscriptionDTO dto = subscriptionService.subscribePatient(user, req.getPlanId(), req.getBillingCycle());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.warn("Failed to subscribe user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to process subscription."));
        }
    }

    @PostMapping("/subscriptions/cancel")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> cancelSubscription(@AuthenticationPrincipal User user) {
        try {
            UserSubscriptionDTO dto = subscriptionService.cancelSubscription(user);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.warn("Failed to cancel subscription for user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to cancel subscription."));
        }
    }

    @PostMapping("/subscriptions/renew")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> renewSubscription(@AuthenticationPrincipal User user, @RequestBody RenewRequest req) {
        try {
            UserSubscriptionDTO dto = subscriptionService.renewSubscription(user, req.getBillingCycle());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.warn("Failed to renew subscription for user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to renew subscription."));
        }
    }

    @GetMapping("/subscriptions/history")
    @PreAuthorize("hasRole('PATIENT') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getSubscriptionHistory(@AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(subscriptionService.getSubscriptionHistory(user));
        } catch (Exception e) {
            log.warn("Failed to fetch subscription history for user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to fetch subscription history."));
        }
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/subscriptions/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> adminGetAllPlans() {
        try {
            return ResponseEntity.ok(subscriptionService.adminGetAllPlans());
        } catch (Exception e) {
            log.error("Admin failed to fetch plans", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to fetch plans."));
        }
    }

    @GetMapping("/admin/subscriptions")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> adminGetAllSubscriptions(@RequestParam(required = false) String status) {
        try {
            return ResponseEntity.ok(subscriptionService.adminGetAllSubscriptions(status));
        } catch (Exception e) {
            log.error("Admin failed to fetch subscriptions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to fetch subscriptions."));
        }
    }

    @PostMapping("/admin/subscriptions/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createPlan(@RequestBody SubscriptionPlanDTO dto) {
        try {
            return ResponseEntity.ok(subscriptionService.createPlan(dto));
        } catch (Exception e) {
            log.warn("Admin failed to create plan: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to create plan."));
        }
    }

    @PutMapping("/admin/subscriptions/plans/{planId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updatePlan(@PathVariable UUID planId, @RequestBody SubscriptionPlanDTO dto) {
        try {
            return ResponseEntity.ok(subscriptionService.updatePlan(planId, dto));
        } catch (Exception e) {
            log.warn("Admin failed to update plan {}: {}", planId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to update plan."));
        }
    }

    @DeleteMapping("/admin/subscriptions/plans/{planId}/deactivate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deactivatePlan(@PathVariable UUID planId) {
        try {
            subscriptionService.deactivatePlan(planId);
            return ResponseEntity.ok(Map.of("message", "Plan deactivated successfully"));
        } catch (Exception e) {
            log.warn("Admin failed to deactivate plan {}: {}", planId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to deactivate plan."));
        }
    }

    @PostMapping("/admin/subscriptions/assign")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> adminAssignSubscription(@RequestBody AdminAssignRequest req) {
        try {
            UserSubscriptionDTO dto = subscriptionService.adminAssignSubscription(req.getUserId(), req.getPlanId(), req.getBillingCycle());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.warn("Admin failed to assign subscription: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to assign subscription."));
        }
    }

    @DeleteMapping("/admin/subscriptions/{subscriptionId}/cancel")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> adminCancelSubscription(@PathVariable UUID subscriptionId) {
        try {
            subscriptionService.adminCancelSubscription(subscriptionId);
            return ResponseEntity.ok(Map.of("message", "Subscription cancelled successfully"));
        } catch (Exception e) {
            log.warn("Admin failed to cancel subscription {}: {}", subscriptionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to cancel subscription."));
        }
    }

    // --- Request DTOs ---

    @Data
    public static class SubscribeRequest {
        private UUID planId;
        private String billingCycle;
    }

    @Data
    public static class RenewRequest {
        private String billingCycle;
    }

    @Data
    public static class AdminAssignRequest {
        private UUID userId;
        private UUID planId;
        private String billingCycle;
    }
}
