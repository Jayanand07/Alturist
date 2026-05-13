package com.altruist.repository;

import com.altruist.model.SupportMessage;
import com.altruist.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, UUID> {
    List<SupportMessage> findByTicketOrderByCreatedAtAsc(SupportTicket ticket);
    long countByTicketAndIsReadFalseAndSenderRoleNot(SupportTicket ticket, String role);
}
