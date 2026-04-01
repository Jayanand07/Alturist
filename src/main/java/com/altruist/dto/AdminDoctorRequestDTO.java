package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDoctorRequestDTO {
    private String fullName;
    private String email;
    private String specialization;
    private String medicalLicense;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private String qualification;
}
