package com.altruist.service;

import com.altruist.dto.SubscriptionPlanDTO;
import com.altruist.dto.UserSubscriptionDTO;
import com.altruist.model.SubscriptionPlan;
import com.altruist.model.User;
import com.altruist.model.UserSubscription;
import com.altruist.repository.SubscriptionPlanRepository;
import com.altruist.repository.UserRepository;
import com.altruist.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserRepository userRepository;

    @Cacheable(value = "subscriptionPlans")
    public List<SubscriptionPlanDTO> getAllActivePlans() {
        return planRepository.findByIsActiveTrue().stream()
                .map(this::toPlanDTO)
                .collect(Collectors.toList());
    }

    public SubscriptionPlanDTO getPlanById(UUID planId) {
        return planRepository.findById(planId)
                .map(this::toPlanDTO)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
    }

    @Transactional
    public UserSubscriptionDTO subscribePatient(User user, UUID planId, String billingCycle) {
        Optional<UserSubscription> existingActive = userSubscriptionRepository.findByUserAndStatus(user, "ACTIVE");
        if (existingActive.isPresent()) {
            throw new RuntimeException("User already has an ACTIVE subscription");
        }

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));

        if (!plan.getIsActive()) {
            throw new RuntimeException("Subscription plan is no longer active");
        }

        UserSubscription subscription = new UserSubscription();
        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setBillingCycle(billingCycle);
        subscription.setStatus("ACTIVE");
        subscription.setStartDate(LocalDate.now());
        
        if ("YEARLY".equalsIgnoreCase(billingCycle)) {
            subscription.setEndDate(LocalDate.now().plusYears(1));
        } else {
            subscription.setEndDate(LocalDate.now().plusMonths(1));
        }
        
        subscription.setNextBillingDate(subscription.getEndDate());
        subscription.setConsultationsUsed(0);
        subscription.setConsultationsRemaining(plan.getConsultationsPerMonth());

        UserSubscription saved = userSubscriptionRepository.save(subscription);
        return toSubscriptionDTO(saved);
    }

    @Transactional
    public UserSubscriptionDTO cancelSubscription(User user) {
        UserSubscription subscription = userSubscriptionRepository.findByUserAndStatus(user, "ACTIVE")
                .orElseThrow(() -> new RuntimeException("No active subscription found"));

        subscription.setStatus("CANCELLED");
        return toSubscriptionDTO(userSubscriptionRepository.save(subscription));
    }

    @Transactional
    public UserSubscriptionDTO renewSubscription(User user, String billingCycle) {
        UserSubscription currentSub = userSubscriptionRepository.findByUserAndStatus(user, "ACTIVE")
                .orElseThrow(() -> new RuntimeException("No active subscription found to renew"));

        currentSub.setStatus("EXPIRED");
        userSubscriptionRepository.save(currentSub);

        return subscribePatient(user, currentSub.getPlan().getId(), billingCycle);
    }

    public UserSubscriptionDTO getCurrentSubscription(User user) {
        return userSubscriptionRepository.findByUserAndStatus(user, "ACTIVE")
                .map(this::toSubscriptionDTO)
                .orElse(null);
    }

    public List<UserSubscriptionDTO> getSubscriptionHistory(User user) {
        return userSubscriptionRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toSubscriptionDTO)
                .collect(Collectors.toList());
    }

    // --- Admin Methods ---

    public List<SubscriptionPlanDTO> adminGetAllPlans() {
        return planRepository.findAll().stream()
                .map(this::toPlanDTO)
                .collect(Collectors.toList());
    }

    public List<UserSubscriptionDTO> adminGetAllSubscriptions(String status) {
        if (status != null && !status.isBlank() && !status.equals("ALL")) {
            return userSubscriptionRepository.findByStatus(status).stream()
                    .map(this::toSubscriptionDTO)
                    .collect(Collectors.toList());
        }
        return userSubscriptionRepository.findAll().stream()
                .map(this::toSubscriptionDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "subscriptionPlans", allEntries = true)
    public SubscriptionPlanDTO createPlan(SubscriptionPlanDTO dto) {
        SubscriptionPlan plan = new SubscriptionPlan();
        updatePlanFromDTO(plan, dto);
        if (dto.getIsActive() != null) plan.setIsActive(dto.getIsActive());
        else plan.setIsActive(true);
        return toPlanDTO(planRepository.save(plan));
    }

    @Transactional
    @CacheEvict(value = "subscriptionPlans", allEntries = true)
    public SubscriptionPlanDTO updatePlan(UUID planId, SubscriptionPlanDTO dto) {
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
        updatePlanFromDTO(plan, dto);
        if (dto.getIsActive() != null) plan.setIsActive(dto.getIsActive());
        return toPlanDTO(planRepository.save(plan));
    }

    @Transactional
    @CacheEvict(value = "subscriptionPlans", allEntries = true)
    public void deactivatePlan(UUID planId) {
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
        plan.setIsActive(false);
        planRepository.save(plan);
    }

    @Transactional
    public UserSubscriptionDTO adminAssignSubscription(UUID userId, UUID planId, String billingCycle) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<UserSubscription> existingActive = userSubscriptionRepository.findByUserAndStatus(user, "ACTIVE");
        existingActive.ifPresent(sub -> {
            sub.setStatus("CANCELLED");
            userSubscriptionRepository.save(sub);
        });

        return subscribePatient(user, planId, billingCycle);
    }

    @Transactional
    public void adminCancelSubscription(UUID subscriptionId) {
        UserSubscription sub = userSubscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        sub.setStatus("CANCELLED");
        userSubscriptionRepository.save(sub);
    }

    // --- Mappers ---

    private SubscriptionPlanDTO toPlanDTO(SubscriptionPlan plan) {
        return new SubscriptionPlanDTO(
                plan.getId(), plan.getName(), plan.getDescription(),
                plan.getMonthlyPrice(), plan.getYearlyPrice(), plan.getConsultationsPerMonth(),
                plan.getLabDiscountEnabled(), plan.getLabDiscountPercent(),
                plan.getMedicineDiscountEnabled(), plan.getMedicineDiscountPercent(),
                plan.getPrioritySupport(), plan.getIsActive(), plan.getCreatedAt()
        );
    }

    private void updatePlanFromDTO(SubscriptionPlan plan, SubscriptionPlanDTO dto) {
        if (dto.getName() != null) plan.setName(dto.getName());
        if (dto.getDescription() != null) plan.setDescription(dto.getDescription());
        if (dto.getMonthlyPrice() != null) plan.setMonthlyPrice(dto.getMonthlyPrice());
        if (dto.getYearlyPrice() != null) plan.setYearlyPrice(dto.getYearlyPrice());
        if (dto.getConsultationsPerMonth() != null) plan.setConsultationsPerMonth(dto.getConsultationsPerMonth());
        if (dto.getLabDiscountEnabled() != null) plan.setLabDiscountEnabled(dto.getLabDiscountEnabled());
        if (dto.getLabDiscountPercent() != null) plan.setLabDiscountPercent(dto.getLabDiscountPercent());
        if (dto.getMedicineDiscountEnabled() != null) plan.setMedicineDiscountEnabled(dto.getMedicineDiscountEnabled());
        if (dto.getMedicineDiscountPercent() != null) plan.setMedicineDiscountPercent(dto.getMedicineDiscountPercent());
        if (dto.getPrioritySupport() != null) plan.setPrioritySupport(dto.getPrioritySupport());
    }

    private UserSubscriptionDTO toSubscriptionDTO(UserSubscription sub) {
        return new UserSubscriptionDTO(
                sub.getId(), sub.getPlan().getName(), sub.getBillingCycle(),
                sub.getStatus(), sub.getStartDate(), sub.getEndDate(),
                sub.getNextBillingDate(), sub.getConsultationsUsed(),
                sub.getConsultationsRemaining(), sub.getPlan().getMonthlyPrice(),
                sub.getPlan().getYearlyPrice(), sub.getUser().getFullName()
        );
    }
}
