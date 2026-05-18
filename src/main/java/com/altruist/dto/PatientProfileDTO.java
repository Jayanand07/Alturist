package com.altruist.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileDTO {

    @Size(max = 120)
    private String fullName;

    @Email
    @Size(max = 254)
    private String email;

    @Pattern(regexp = "^$|^\\+?[0-9]{7,15}$", message = "phone must contain 7 to 15 digits")
    private String phone;

    @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "dateOfBirth must use yyyy-MM-dd")
    private String dateOfBirth;

    @Pattern(regexp = "^$|^(MALE|FEMALE|OTHER)$", message = "gender must be MALE, FEMALE, or OTHER")
    private String gender;

    @Size(max = 2048)
    private String profilePictureUrl;

    @Pattern(regexp = "^$|^(A|B|AB|O)[+-]$", message = "bloodGroup must be a valid ABO blood group")
    private String bloodGroup;

    @Size(max = 180)
    private String street;

    @Size(max = 80)
    private String city;

    @Size(max = 80)
    private String state;

    @Pattern(regexp = "^$|^[A-Za-z0-9 -]{3,12}$", message = "pincode contains invalid characters")
    private String pincode;

    @Size(max = 4000)
    private String allergies;

    @Size(max = 4000)
    private String chronicConditions;

    @Size(max = 4000)
    private String currentMedications;

    private Boolean emailAlerts;
    private Boolean smsAlerts;
    private Boolean appointmentReminders;
}
