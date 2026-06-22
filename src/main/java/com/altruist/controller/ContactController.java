package com.altruist.controller;

import com.altruist.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    @Data
    public static class CallbackRequest {
        private String phone;
    }

    @PostMapping("/callback")
    public ResponseEntity<?> requestCallback(@RequestBody CallbackRequest request) {
        if (request == null || request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            errors.put("error", "Phone number is required");
            return ResponseEntity.badRequest().body(errors);
        }

        String phone = request.getPhone().trim();
        // Basic digits check - allow +, spaces, dashes, digits
        if (!phone.matches("^[\\d\\s\\+\\-]{10,15}$")) {
            Map<String, String> errors = new HashMap<>();
            errors.put("error", "Invalid phone number. Must be between 10 and 15 characters.");
            return ResponseEntity.badRequest().body(errors);
        }

        log.info("Lead Callback Captured: Requested callback for phone number [{}]", phone);

        // Send email notification to support team
        emailService.sendCallbackNotificationEmail(phone);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Callback request registered successfully. Our advisor will call you shortly.");
        return ResponseEntity.ok(response);
    }
}
