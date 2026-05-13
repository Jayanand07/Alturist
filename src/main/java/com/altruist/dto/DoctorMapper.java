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
                .profilePictureUrl(doctor.getProfilePictureUrl() != null ? doctor.getProfilePictureUrl() : (user != null ? user.getProfilePictureUrl() : null))
                .totalConsultations(doctor.getTotalConsultations())
                .isAvailable(doctor.getIsAvailable()) // Added isAvailable
                .city(doctor.getCity())
                .clinicName(doctor.getClinicName())
                .isVerified(doctor.getIsVerified())
                .bio(doctor.getBio())
                .languages(doctor.getLanguages())
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
                .profilePictureUrl(doctor.getProfilePictureUrl() != null ? doctor.getProfilePictureUrl() : (user != null ? user.getProfilePictureUrl() : null))
                .city(doctor.getCity())
                .clinicName(doctor.getClinicName())
                .clinicAddress(doctor.getClinicAddress())
                .clinicPhone(doctor.getClinicPhone())
                .latitude(doctor.getLatitude())
                .longitude(doctor.getLongitude())
                .isVerified(doctor.getIsVerified())
                .bio(doctor.getBio())
                .languages(doctor.getLanguages())
                .build();
    }

    public static void updateDoctorFromRequest(Doctor doctor, AdminDoctorRequestDTO dto) {
        if (doctor == null || dto == null) return;
        
        if (dto.getSpecialization() != null) doctor.setSpecialization(dto.getSpecialization());
        if (dto.getMedicalLicense() != null) doctor.setMedicalLicense(dto.getMedicalLicense());
        if (dto.getQualification() != null) doctor.setQualification(dto.getQualification());
        if (dto.getExperienceYears() != null) doctor.setExperienceYears(dto.getExperienceYears());
        if (dto.getConsultationFee() != null) doctor.setConsultationFee(dto.getConsultationFee());
        if (dto.getCity() != null) doctor.setCity(dto.getCity());
        if (dto.getClinicName() != null) doctor.setClinicName(dto.getClinicName());
        if (dto.getClinicAddress() != null) doctor.setClinicAddress(dto.getClinicAddress());
        if (dto.getClinicPhone() != null) doctor.setClinicPhone(dto.getClinicPhone());
        if (dto.getLatitude() != null) doctor.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) doctor.setLongitude(dto.getLongitude());
        if (dto.getIsVerified() != null) doctor.setIsVerified(dto.getIsVerified());
        if (dto.getBio() != null) doctor.setBio(dto.getBio());
        if (dto.getLanguages() != null) doctor.setLanguages(dto.getLanguages());
        if (dto.getProfilePictureUrl() != null) doctor.setProfilePictureUrl(dto.getProfilePictureUrl());
    }
}
