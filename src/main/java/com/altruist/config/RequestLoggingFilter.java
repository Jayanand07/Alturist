package com.altruist.config;

import com.altruist.model.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Profile("dev")
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        if (!requestURI.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            String method = request.getMethod();
            String fullPath = requestURI;
            if (request.getQueryString() != null) {
                fullPath += "?" + request.getQueryString();
            }

            int status = response.getStatus();
            
            String role = "ANONYMOUS";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                if (auth.getPrincipal() instanceof User) {
                    role = ((User) auth.getPrincipal()).getUserType().name();
                } else {
                    role = auth.getAuthorities().toString();
                }
            }

            logger.info("[API REQUEST] Method: {}, Path: {}, Role: {}, Status: {}", method, fullPath, role, status);
        }
    }
}
