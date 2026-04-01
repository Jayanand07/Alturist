package com.altruist.controller;

import com.altruist.dto.ConsultationHistoryDTO;
import com.altruist.dto.PatientDashboardDTO;
import com.altruist.model.User;
import com.altruist.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/dashboard")
    public ResponseEntity<PatientDashboardDTO> getDashboard() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        PatientDashboardDTO data = patientService.getDashboardData(user);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/consultations")
    public ResponseEntity<Page<ConsultationHistoryDTO>> getConsultationHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String specialization) {

        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "scheduledAt"));
        Page<ConsultationHistoryDTO> history = patientService.getConsultationHistory(
                user.getId(), pageable, status, dateRange, specialization);

        return ResponseEntity.ok(history);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }
        return (User) authentication.getPrincipal();
    }
}
