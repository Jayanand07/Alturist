package com.altruist.security;

import com.altruist.model.User;
import com.altruist.service.UserService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthFilter.class);

    // Can be null if credentials path is not set yet
    private final FirebaseAuth firebaseAuth;
    private final UserService userService;
    private final Map<String, User> userCache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (firebaseAuth == null) {
            logger.error("FirebaseAuth is missing. Check FIREBASE_CREDENTIALS_PATH.");
            sendUnauthorizedError(response, "Firebase Auth is not properly configured on the server");
            return;
        }

        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);

            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            // Extract phone securely from token claims if present
            String phone = (String) decodedToken.getClaims().get("phone_number");

            // Cache check to prevent N+1 DB lookups
            User user = userCache.get(uid);
            if (user == null) {
                // Get or initialize user inside DB
                user = userService.findOrCreateUserByFirebaseUid(uid, email, phone);
                userCache.put(uid, user);
            }

            // Set Spring Security Context with roles
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getUserType().name());
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user, null, Collections.singletonList(authority));
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (FirebaseAuthException e) {
            logger.warn("Firebase token verification failed: {}", e.getMessage());
            sendUnauthorizedError(response, "Invalid Firebase Authorization token");
            return;
        } catch (Exception e) {
            logger.error("Error during authentication process", e);
            sendUnauthorizedError(response, "Internal Authentication Error");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendUnauthorizedError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + message + "\"}");
    }
}
