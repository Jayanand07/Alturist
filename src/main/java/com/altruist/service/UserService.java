package com.altruist.service;

import com.altruist.dto.SyncUserRequestDTO;
import com.altruist.model.User;
import com.altruist.model.UserType;
import com.altruist.model.Doctor;
import com.altruist.repository.UserRepository;
import com.altruist.repository.DoctorRepository;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public User findOrCreateUserByFirebaseUid(String firebaseUid, String email, String phone) {
        return findOrCreateUserByFirebaseUid(firebaseUid, email, phone, null);
    }

    @Transactional
    public User findOrCreateUserByFirebaseUid(String firebaseUid, String email, String phone, FirebaseToken firebaseToken) {
        Optional<User> existingUserOpt = userRepository.findByFirebaseUid(firebaseUid);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            boolean updated = false;
            
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
                updated = true;
            }
            if (phone != null && !phone.equals(user.getPhone())) {
                user.setPhone(phone);
                updated = true;
            }

            if (updated) {
                return userRepository.save(user);
            }
            return user;
        }

        User newUser = new User();
        newUser.setFirebaseUid(firebaseUid);
        newUser.setEmail(email);
        newUser.setPhone(phone);
        // Derive user role from Firebase token claims, defaulting to PATIENT
        if (firebaseToken != null) {
            String roleClaimRaw = firebaseToken.getClaims().getOrDefault("role", "PATIENT").toString();
            UserType userType;
            try {
                userType = UserType.valueOf(roleClaimRaw.toUpperCase());
            } catch (IllegalArgumentException e) {
                userType = UserType.PATIENT;
            }
            newUser.setUserType(userType);
        } else {
            newUser.setUserType(UserType.PATIENT);
        }

        return userRepository.save(newUser);
    }

    @Transactional
    public User updateUserProfile(User user, SyncUserRequestDTO request) {
        boolean updated = false;

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
            updated = true;
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
            updated = true;
        }
        if (request.getDateOfBirth() != null) {
            try {
                LocalDate dob = LocalDate.parse(request.getDateOfBirth());
                if (dob.isAfter(LocalDate.now())) {
                    throw new IllegalArgumentException("Date of birth cannot be in the future");
                }
                user.setDateOfBirth(dob);
                updated = true;
            } catch (DateTimeParseException e) {
                // Ignore invalid date formats
            } catch (IllegalArgumentException e) {
                throw e; // Re-throw validation errors
            }
        }
        if (request.getUserType() != null) {
            try {
                user.setUserType(UserType.valueOf(request.getUserType().toUpperCase()));
                updated = true;
            } catch (Exception e) {
                // Ignore invalid user types
            }
        }

        if (updated) {
            user = userRepository.save(user);
        }

        // Auto-create Doctor profile if it is missing
        if (user.getUserType() == UserType.DOCTOR) {
            Optional<Doctor> existingDoctorOpt = doctorRepository.findByUserId(user.getId());
            if (existingDoctorOpt.isEmpty()) {
                Doctor newDoctor = new Doctor();
                newDoctor.setUser(user);
                newDoctor.setIsVerified(true); // Automatically verify synced profiles in dev
                newDoctor.setIsAvailable(true);
                newDoctor.setRating(5.0);
                newDoctor.setTotalConsultations(0);
                
                // Fallback default city from user details
                if (user.getCity() != null) {
                    newDoctor.setCity(user.getCity());
                } else {
                    newDoctor.setCity("Amritsar");
                }
                
                if (request.getDoctorInfo() != null) {
                    newDoctor.setSpecialization(request.getDoctorInfo().getSpecialization() != null && !request.getDoctorInfo().getSpecialization().isBlank()
                            ? request.getDoctorInfo().getSpecialization() : "General Physician");
                    newDoctor.setMedicalLicense(request.getDoctorInfo().getMedicalLicense() != null && !request.getDoctorInfo().getMedicalLicense().isBlank()
                            ? request.getDoctorInfo().getMedicalLicense() : "LIC-" + UUID.randomUUID().toString().substring(0, 8));
                    newDoctor.setExperienceYears(request.getDoctorInfo().getExperienceYears() != null ? request.getDoctorInfo().getExperienceYears() : 5);
                    newDoctor.setConsultationFee(request.getDoctorInfo().getConsultationFee() != null 
                            ? BigDecimal.valueOf(request.getDoctorInfo().getConsultationFee()) : BigDecimal.valueOf(500.0));
                } else {
                    newDoctor.setSpecialization("General Physician");
                    newDoctor.setMedicalLicense("LIC-" + UUID.randomUUID().toString().substring(0, 8));
                    newDoctor.setExperienceYears(5);
                    newDoctor.setConsultationFee(BigDecimal.valueOf(500.0));
                }
                
                doctorRepository.save(newDoctor);
            }
        }

        return user;
    }
}
