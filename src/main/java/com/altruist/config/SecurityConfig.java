package com.altruist.config;

import com.altruist.security.FirebaseAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final FirebaseAuthFilter firebaseAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── Public: no auth required ──────────────────────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Public doctor discovery
                        .requestMatchers(HttpMethod.GET, "/api/doctors").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/available").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/cities").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/specialties").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/{id}").permitAll()

                        // Public subscription plans listing
                        .requestMatchers(HttpMethod.GET, "/api/subscriptions/plans").permitAll()

                        // Public vlogs
                        .requestMatchers(HttpMethod.GET, "/api/vlogs").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vlogs/{id}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/vlogs/{id}/view").permitAll()

                        // Public medicines catalog
                        .requestMatchers(HttpMethod.GET, "/api/medicines", "/api/medicines/**").permitAll()

                        // Public lab tests & packages
                        .requestMatchers(HttpMethod.GET, "/api/lab-tests/featured").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/lab-packages").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/lab-categories").permitAll()
                        
                        // Public lead callback capture
                        .requestMatchers(HttpMethod.POST, "/api/contact/callback").permitAll()
                        
                        // Public testimonials
                        .requestMatchers(HttpMethod.GET, "/api/testimonials").permitAll()

                        // ── PATIENT role ──────────────────────────────────────
                        .requestMatchers("/api/patients/**").hasRole("PATIENT")
                        .requestMatchers("/api/patient/**").hasAnyRole("PATIENT", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/lab-bookings", "/api/lab-bookings/**").hasRole("PATIENT")
                        .requestMatchers("/api/support/tickets", "/api/support/tickets/**").hasAnyRole("PATIENT", "ADMIN", "SUPER_ADMIN", "DOCTOR")
                        .requestMatchers("/api/subscriptions/my").hasAnyRole("PATIENT", "SUPER_ADMIN")
                        .requestMatchers("/api/subscriptions/subscribe").hasAnyRole("PATIENT", "SUPER_ADMIN")
                        .requestMatchers("/api/subscriptions/cancel").hasAnyRole("PATIENT", "SUPER_ADMIN")
                        .requestMatchers("/api/subscriptions/renew").hasAnyRole("PATIENT", "SUPER_ADMIN")
                        .requestMatchers("/api/subscriptions/history").hasAnyRole("PATIENT", "SUPER_ADMIN")

                        // ── DOCTOR role ───────────────────────────────────────
                        .requestMatchers("/api/doctors/dashboard").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/profile").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/my/**").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/availability").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/earnings").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/schedule/**").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/instant-queue").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/accept-instant/**").hasRole("DOCTOR")
                        .requestMatchers("/api/doctors/reschedule-requests").hasRole("DOCTOR")

                        // Doctors list (admin or doctor edit/delete)
                        .requestMatchers(HttpMethod.PUT, "/api/doctors/{id}").hasAnyRole("ADMIN", "DOCTOR", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/doctors/{id}").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // ── Consultations (authenticated) ────────────────────
                        .requestMatchers("/api/consultations", "/api/consultations/**").authenticated()
                        .requestMatchers("/api/orders", "/api/orders/**").authenticated()
                        .requestMatchers("/api/prescriptions", "/api/prescriptions/**").authenticated()
                        .requestMatchers("/api/notifications", "/api/notifications/**").authenticated()

                        // ── Support ticket solver (Admins & Doctors) ──────────
                        .requestMatchers("/api/admin/support/tickets", "/api/admin/support/tickets/**").hasAnyRole("ADMIN", "SUPER_ADMIN", "DOCTOR")

                        // ── SUPER_ADMIN role ─────────────────────────────────
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // ── Deny-by-default: reject everything else ──────────
                        .anyRequest().denyAll()
                )
                .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
