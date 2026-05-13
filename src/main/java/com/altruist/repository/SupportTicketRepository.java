package com.altruist.repository;

import com.altruist.model.SupportTicket;
import com.altruist.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {
    List<SupportTicket> findByPatientOrderByCreatedAtDesc(User patient);
    List<SupportTicket> findByStatus(String status);
    List<SupportTicket> findByPatientAndStatus(User patient, String status);
}
