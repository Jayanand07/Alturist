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
import java.time.Instant;
import java.util.Collections;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthFilter.class);

    /** Cache TTL: 5 minutes. After this, token is re-verified against Firebase. */
    private static final long CACHE_TTL_MS = 5 * 60 * 1000L;

    private final FirebaseAuth firebaseAuth;
    private final UserService userService;

    /** Value = [User, expiry epoch ms] */
    private final Map<String, CacheEntry> userCache = new ConcurrentHashMap<>();

    private static class CacheEntry {
        final User user;
        final long expiresAt;

        CacheEntry(User user) {
            this.user = user;
            this.expiresAt = Instant.now().toEpochMilli() + CACHE_TTL_MS;
        }

        boolean isExpired() {
            return Instant.now().toEpochMilli() > expiresAt;
        }
    }

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
            logger.warn("FirebaseAuth bean is null — server misconfiguration");
            sendUnauthorizedError(response);
            return;
        }

        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);

            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String phone = (String) decodedToken.getClaims().get("phone_number");

            // TTL-based cache: evict expired entries and re-fetch if needed
            CacheEntry entry = userCache.get(uid);
            User user;
            if (entry == null || entry.isExpired()) {
                // Evict the expired entry
                userCache.remove(uid);
                user = userService.findOrCreateUserByFirebaseUid(uid, email, phone);
                userCache.put(uid, new CacheEntry(user));
                // Periodically clean up stale entries (simple amortized cleanup)
                if (!userCache.isEmpty()) {
                    evictExpiredEntries();
                }
            } else {
                user = entry.user;
            }

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getUserType().name());
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user, null, Collections.singletonList(authority));
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (FirebaseAuthException e) {
            // SECURITY: Log at WARN (not ERROR) — expected for expired/invalid tokens.
            //           Never expose Firebase error codes or token details in the response.
            logger.warn("Firebase token verification failed for request {} {}", request.getMethod(), request.getRequestURI());
            sendUnauthorizedError(response);
            return;
        } catch (Exception e) {
            // SECURITY: Unexpected errors during auth — log full stack server-side only.
            logger.warn("Authentication processing error for request {} {}: {}", request.getMethod(), request.getRequestURI(), e.getClass().getSimpleName());
            sendUnauthorizedError(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    /** Remove all expired entries from cache (called on every cache miss). */
    private void evictExpiredEntries() {
        Iterator<Map.Entry<String, CacheEntry>> it = userCache.entrySet().iterator();
        while (it.hasNext()) {
            if (it.next().getValue().isExpired()) {
                it.remove();
            }
        }
    }

    /**
     * SECURITY: Always return the same generic 401 body.
     * Never include token details, Firebase error codes, or stack traces.
     */
    private void sendUnauthorizedError(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\": \"Unauthorized\"}");
    }
}
