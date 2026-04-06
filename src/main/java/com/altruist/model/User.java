package com.altruist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_firebase_uid", columnList = "firebaseUid", unique = true),
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_phone", columnList = "phone")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String firebaseUid;

    private String email;

    private String phone;

    private String fullName;

    private LocalDate dateOfBirth;

    private String gender;

    private String profilePictureUrl;

    private String bloodGroup;
    private String street;
    private String city;
    private String state;
    private String pincode;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String chronicConditions;

    @Column(columnDefinition = "TEXT")
    private String currentMedications;

    private Boolean emailAlerts = true;
    private Boolean smsAlerts = true;
    private Boolean appointmentReminders = true;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserType userType;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * Deduplicates a comma-separated string field using LinkedHashSet to preserve order.
     */
    private static String deduplicateCsv(String csv) {
        if (csv == null || csv.isBlank()) return csv;
        String[] parts = csv.split(",");
        LinkedHashSet<String> unique = new LinkedHashSet<>();
        for (String part : parts) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                unique.add(trimmed);
            }
        }
        return String.join(", ", unique);
    }

    public void setAllergies(String allergies) {
        this.allergies = deduplicateCsv(allergies);
    }

    public void setChronicConditions(String chronicConditions) {
        this.chronicConditions = deduplicateCsv(chronicConditions);
    }

    public void setCurrentMedications(String currentMedications) {
        this.currentMedications = deduplicateCsv(currentMedications);
    }
}
