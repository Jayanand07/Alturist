package com.altruist.dto;

import com.altruist.model.Doctor;
import com.altruist.model.User;

public final class DoctorMapper {

    private DoctorMapper() {
        // Utility class — no instantiation
    }

    public static DoctorListDTO toListDTO(Doctor doctor) {
        if (doctor == null) return null;

        User user = doctor.getUser();
        return DoctorListDTO.builder()
                .id(doctor.getId())
                .name(user != null ? user.getFullName() : null)
                .email(user != null ? user.getEmail() : null) // Added email
                .specialization(doctor.getSpecialization())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .rating(doctor.getRating())
                .profilePictureUrl(user != null ? user.getProfilePictureUrl() : null)
                .totalConsultations(doctor.getTotalConsultations())
                .isAvailable(doctor.getIsAvailable()) // Added isAvailable
                .build();
    }

    public static DoctorDetailDTO toDetailDTO(Doctor doctor) {
        if (doctor == null) return null;

        User user = doctor.getUser();
        return DoctorDetailDTO.builder()
                .id(doctor.getId())
                .name(user != null ? user.getFullName() : null)
                .specialization(doctor.getSpecialization())
                .qualification(doctor.getQualification())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .isAvailable(doctor.getIsAvailable())
                .rating(doctor.getRating())
                .totalConsultations(doctor.getTotalConsultations())
                .profilePictureUrl(user != null ? user.getProfilePictureUrl() : null)
                .build();
    }
}
