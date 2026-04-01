package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDetailDTO {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private String qualification;
    private String medicalLicense;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private Boolean isAvailable;
    private Double rating;
    private Integer totalConsultations;
    private String profilePictureUrl;
}
