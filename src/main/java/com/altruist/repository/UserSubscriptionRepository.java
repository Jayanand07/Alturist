package com.altruist.repository;

import com.altruist.model.User;
import com.altruist.model.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, UUID> {
    Optional<UserSubscription> findByUserAndStatus(User user, String status);
    List<UserSubscription> findByUserOrderByCreatedAtDesc(User user);
    List<UserSubscription> findByStatus(String status);
}
