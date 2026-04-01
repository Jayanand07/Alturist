package com.altruist.controller;

import com.altruist.dto.SyncUserRequestDTO;
import com.altruist.dto.UserResponseDTO;
import com.altruist.model.User;
import com.altruist.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * Endpoint for the frontend to synchronize its authenticated Firebase user with the local DB.
     * The FirebaseAuthFilter handles the underlying verification and DB persistence.
     * This endpoint returns the finalized user record and handles optional metadata updates.
     */
    @PostMapping("/sync")
    public ResponseEntity<UserResponseDTO> syncUser(@RequestBody(required = false) SyncUserRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        
        // Update profile details if provided in request body
        if (request != null) {
            user = userService.updateUserProfile(user, request);
        }

        return ResponseEntity.ok(UserResponseDTO.fromUser(user));
    }
}
