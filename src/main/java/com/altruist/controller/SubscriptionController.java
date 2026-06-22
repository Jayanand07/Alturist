package com.altruist.controller;

import com.altruist.dto.SubscriptionPlanDTO;
import com.altruist.dto.UserSubscriptionDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import com.altruist.model.User;
import com.altruist.model.Subscription;
import com.altruist.repository.SubscriptionRepository;
import com.altruist.repository.UserRepository;
import com.altruist.service.SubscriptionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.Optional;
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
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

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
    public ResponseEntity<?> subscribe(@AuthenticationPrincipal User user, @Valid @RequestBody SubscribeRequest req) {
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
    public ResponseEntity<?> renewSubscription(@AuthenticationPrincipal User user, @Valid @RequestBody RenewRequest req) {
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
    public ResponseEntity<?> createPlan(@Valid @RequestBody SubscriptionPlanDTO dto) {
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
    public ResponseEntity<?> updatePlan(@PathVariable UUID planId, @Valid @RequestBody SubscriptionPlanDTO dto) {
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
    public ResponseEntity<?> adminAssignSubscription(@Valid @RequestBody AdminAssignRequest req) {
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

    // --- Manual Subscription Endpoints ---

    @PostMapping("/admin/subscriptions")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> createManualSubscription(@Valid @RequestBody ManualSubscriptionRequest req) {
        try {
            Optional<User> patientOpt = userRepository.findById(req.getPatientId());
            if (patientOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Patient not found"));
            }

            Subscription subscription = new Subscription();
            subscription.setPatient(patientOpt.get());
            subscription.setPlanName(req.getPlanName());
            subscription.setPlanType(req.getPlanType());
            subscription.setStartDate(req.getStartDate());
            subscription.setEndDate(req.getEndDate());
            subscription.setAmountPaid(req.getAmountPaid());
            subscription.setPaymentMethod(req.getPaymentMethod());
            subscription.setStatus(req.getStatus() != null ? req.getStatus() : "ACTIVE");
            subscription.setNotes(req.getNotes());
            subscription.setCreatedByAdmin(true);

            Subscription saved = subscriptionRepository.save(subscription);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            log.error("Failed to create manual subscription", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to create subscription: " + e.getMessage()));
        }
    }

    @GetMapping("/patient/subscriptions")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getPatientSubscriptions(@AuthenticationPrincipal User user) {
        try {
            List<Subscription> subs = subscriptionRepository.findByPatientIdOrderByStartDateDesc(user.getId());
            return ResponseEntity.ok(subs);
        } catch (Exception e) {
            log.error("Failed to fetch patient subscriptions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch subscriptions."));
        }
    }

    @GetMapping("/admin/subscriptions/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getSubscriptionsForPatient(@PathVariable UUID patientId) {
        try {
            List<Subscription> subs = subscriptionRepository.findByPatientIdOrderByStartDateDesc(patientId);
            return ResponseEntity.ok(subs);
        } catch (Exception e) {
            log.error("Failed to fetch patient subscriptions for admin", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch subscriptions."));
        }
    }

    // --- Request DTOs ---

    @Data
    public static class ManualSubscriptionRequest {
        @NotNull(message = "Patient ID is required")
        private UUID patientId;

        @NotBlank(message = "Plan name is required")
        private String planName;

        @NotBlank(message = "Plan type is required")
        private String planType;

        @NotNull(message = "Start date is required")
        private java.time.LocalDate startDate;

        @NotNull(message = "End date is required")
        private java.time.LocalDate endDate;

        @NotNull(message = "Amount paid is required")
        private java.math.BigDecimal amountPaid;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod;

        private String status;
        private String notes;
    }

    @Data
    public static class SubscribeRequest {
        @NotNull(message = "Plan ID is required")
        private UUID planId;

        @NotBlank(message = "Billing cycle is required")
        @Pattern(regexp = "MONTHLY|YEARLY", message = "Billing cycle is invalid")
        private String billingCycle;
    }

    @Data
    public static class RenewRequest {
        @NotBlank(message = "Billing cycle is required")
        @Pattern(regexp = "MONTHLY|YEARLY", message = "Billing cycle is invalid")
        private String billingCycle;
    }

    @Data
    public static class AdminAssignRequest {
        @NotNull(message = "User ID is required")
        private UUID userId;

        @NotNull(message = "Plan ID is required")
        private UUID planId;

        @NotBlank(message = "Billing cycle is required")
        @Pattern(regexp = "MONTHLY|YEARLY", message = "Billing cycle is invalid")
        private String billingCycle;
    }
}
