package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDoctorRequestDTO {
    private String firebaseUid;
    @NotBlank(message = "Full name is required")
    private String fullName;
    @NotBlank(message = "Email is required")
    private String email;
    @NotBlank(message = "Specialization is required")
    private String specialization;
    private String medicalLicense;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private String qualification;
    private String city;
    private String clinicName;
    private String clinicAddress;
    private String clinicPhone;
    private Double latitude;
    private Double longitude;
    private Boolean isVerified;
    private String bio;
    private String languages;
    private String profilePictureUrl;
}
