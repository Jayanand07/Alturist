package com.altruist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPromoteDoctorRequestDTO {
    // User fields (optional updates if editable)
    private String fullName;
    private String email;
    private String phone;

    // Doctor fields
    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Qualification is required")
    private String qualification;

    @NotNull(message = "Experience years is required")
    private Integer experienceYears;

    @NotNull(message = "Consultation fee is required")
    private BigDecimal consultationFee;

    private String clinicName;
    private String clinicAddress;
    private String clinicPhone;
    
    @NotBlank(message = "City is required")
    private String city;

    private String bio;
    private String languages;
    
    @Builder.Default
    private Boolean isVerified = true;
}
