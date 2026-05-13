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
public class DoctorListDTO {
    private UUID id;
    private String name;
    private String email;
    private String specialization;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private Double rating;
    private String profilePictureUrl;
    private Integer totalConsultations;
    private Boolean isAvailable;
    private String city;
    private String clinicName;
    private Boolean isVerified;
    private String bio;
    private String languages;
}
