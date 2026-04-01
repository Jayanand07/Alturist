package com.altruist.dto;

import lombok.Data;

@Data
public class SyncUserRequestDTO {
    private String firebaseUid;
    private String email;
    private String phone;
    private String fullName;
    private String dateOfBirth;
    private String gender;
    private String userType;
    private DoctorInfoRequest doctorInfo;

    @Data
    public static class DoctorInfoRequest {
        private String specialization;
        private String medicalLicense;
        private Integer experienceYears;
        private Double consultationFee;
    }
}
