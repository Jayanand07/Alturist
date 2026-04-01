package com.altruist.repository;

import com.altruist.model.Order;
import com.altruist.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByPatient(User patient, Pageable pageable);
    
    // For Admin
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
