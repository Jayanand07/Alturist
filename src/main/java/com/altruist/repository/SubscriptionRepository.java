package com.altruist.repository;

import com.altruist.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findByPatientIdOrderByStartDateDesc(UUID patientId);
    List<Subscription> findByPatientIdAndStatus(UUID patientId, String status);
}
