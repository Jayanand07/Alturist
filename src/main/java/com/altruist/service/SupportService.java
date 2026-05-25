package com.altruist.service;

import com.altruist.dto.SupportMessageDTO;
import com.altruist.dto.SupportTicketDTO;
import com.altruist.dto.SupportTicketRequestDTO;
import com.altruist.exception.UnauthorizedException;
import com.altruist.model.SupportMessage;
import com.altruist.model.SupportTicket;
import com.altruist.model.User;
import com.altruist.model.UserType;
import com.altruist.repository.SupportMessageRepository;
import com.altruist.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final SupportMessageRepository messageRepository;

    @Transactional
    public SupportTicketDTO createTicket(User patient, SupportTicketRequestDTO dto) {
        SupportTicket ticket = new SupportTicket();
        ticket.setPatient(patient);
        ticket.setSubject(dto.getSubject());
        ticket.setCategory(dto.getCategory());
        ticket.setPriority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM");
        ticket.setStatus("OPEN");
        ticket = ticketRepository.save(ticket);

        if (dto.getFirstMessage() != null && !dto.getFirstMessage().isBlank()) {
            SupportMessage message = new SupportMessage();
            message.setTicket(ticket);
            message.setSender(patient);
            message.setMessage(dto.getFirstMessage());
            message.setSenderRole("PATIENT");
            message.setIsRead(false);
            messageRepository.save(message);
        }

        return toTicketDTO(ticket, isStaff(patient) ? "ADMIN" : "PATIENT");
    }

    public List<SupportTicketDTO> getPatientTickets(User patient) {
        return ticketRepository.findByPatientOrderByCreatedAtDesc(patient).stream()
                .map(t -> toTicketDTO(t, "PATIENT"))
                .collect(Collectors.toList());
    }

    public SupportTicketDTO getTicketById(UUID ticketId, User requester) {
        SupportTicket ticket = getAndValidateTicketAccess(ticketId, requester);
        return toTicketDTO(ticket, isStaff(requester) ? "ADMIN" : "PATIENT");
    }

    @Transactional
    public List<SupportMessageDTO> getMessages(UUID ticketId, User requester) {
        SupportTicket ticket = getAndValidateTicketAccess(ticketId, requester);
        List<SupportMessage> messages = messageRepository.findByTicketOrderByCreatedAtAsc(ticket);

        String requesterRole = isStaff(requester) ? "ADMIN" : "PATIENT";
        
        boolean updated = false;
        for (SupportMessage msg : messages) {
            if (!msg.getSenderRole().equals(requesterRole) && !msg.getIsRead()) {
                msg.setIsRead(true);
                updated = true;
            }
        }
        if (updated) {
            messageRepository.saveAll(messages);
        }

        return messages.stream().map(this::toMessageDTO).collect(Collectors.toList());
    }

    @Transactional
    public SupportMessageDTO sendMessage(UUID ticketId, User sender, String messageText) {
        SupportTicket ticket = getAndValidateTicketAccess(ticketId, sender);

        String senderRole = isStaff(sender) ? "ADMIN" : "PATIENT";

        SupportMessage message = new SupportMessage();
        message.setTicket(ticket);
        message.setSender(sender);
        message.setMessage(messageText);
        message.setSenderRole(senderRole);
        message.setIsRead(false);
        
        SupportMessage saved = messageRepository.save(message);
        
        ticket.setUpdatedAt(LocalDateTime.now());
        if (senderRole.equals("PATIENT") && "RESOLVED".equals(ticket.getStatus())) {
            ticket.setStatus("OPEN");
        }
        ticketRepository.save(ticket);
        
        return toMessageDTO(saved);
    }

    @Transactional
    public void closeTicket(UUID ticketId, User admin) {
        if (!isStaff(admin)) {
            throw new UnauthorizedException("Only support staff can close tickets");
        }
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus("CLOSED");
        ticketRepository.save(ticket);
    }

    @Transactional
    public void updateTicketStatus(UUID ticketId, String status, User admin) {
        if (!isStaff(admin)) {
            throw new UnauthorizedException("Only support staff can update ticket status");
        }
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(status);
        ticketRepository.save(ticket);
    }

    public List<SupportTicketDTO> adminGetAllTickets(String status) {
        List<SupportTicket> tickets;
        if (status != null && !status.isBlank()) {
            tickets = ticketRepository.findByStatus(status);
        } else {
            tickets = ticketRepository.findAll();
        }
        return tickets.stream()
                .map(t -> toTicketDTO(t, "ADMIN"))
                .collect(Collectors.toList());
    }

    private SupportTicket getAndValidateTicketAccess(UUID ticketId, User requester) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (!isStaff(requester) && !ticket.getPatient().getId().equals(requester.getId())) {
            throw new UnauthorizedException("You do not have permission to view this ticket");
        }
        return ticket;
    }

    private boolean isStaff(User user) {
        return user.getUserType() == UserType.SUPER_ADMIN || user.getUserType() == UserType.ADMIN || user.getUserType() == UserType.DOCTOR;
    }

    private SupportTicketDTO toTicketDTO(SupportTicket ticket, String viewerRole) {
        long unreadCount = messageRepository.countByTicketAndIsReadFalseAndSenderRoleNot(ticket, viewerRole);
        return new SupportTicketDTO(
                ticket.getId(), ticket.getSubject(), ticket.getStatus(),
                ticket.getPriority(), ticket.getCategory(),
                ticket.getCreatedAt(), ticket.getUpdatedAt(), unreadCount,
                ticket.getPatient().getFullName()
        );
    }

    private SupportMessageDTO toMessageDTO(SupportMessage message) {
        return new SupportMessageDTO(
                message.getId(), message.getMessage(), message.getSenderRole(),
                message.getSender().getFullName(), message.getIsRead(), message.getCreatedAt()
        );
    }
}
