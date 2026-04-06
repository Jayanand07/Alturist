package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileDTO {

    private String fullName;
    private String email;
    private String phone;
    private String dateOfBirth;
    private String gender;
    private String profilePictureUrl;
    private String bloodGroup;

    private String street;
    private String city;
    private String state;
    private String pincode;

    private String allergies;
    private String chronicConditions;
    private String currentMedications;

    private Boolean emailAlerts;
    private Boolean smsAlerts;
    private Boolean appointmentReminders;
}
