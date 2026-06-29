package com.altruist;

import com.altruist.model.User;
import com.altruist.model.UserType;
import com.altruist.model.Doctor;
import com.altruist.repository.UserRepository;
import com.altruist.repository.DoctorRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.FirebaseAuthException;
import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

@SpringBootTest
@ActiveProfiles("dev")
public class FirebaseUserCreator {

    @Autowired
    private FirebaseAuth firebaseAuth;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @BeforeAll
    public static void loadEnv() {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );
    }

    @Test
    public void createFirebaseTestUsers() {
        System.out.println("=== STARTING FIREBASE AND DATABASE TEST ACCOUNTS SEEDING ===");
        
        // 1. PATIENT
        String patientUid = "test-uid-patient";
        String patientEmail = "patient@test.com";
        createFirebaseAccount(patientUid, patientEmail, "Password@123", "Test Patient");
        createDatabaseUser(patientUid, patientEmail, UserType.PATIENT, "Test Patient");

        // 2. DOCTOR
        String doctorUid = "test-uid-doctor";
        String doctorEmail = "doctor@test.com";
        createFirebaseAccount(doctorUid, doctorEmail, "Password@123", "Test Doctor");
        User docUser = createDatabaseUser(doctorUid, doctorEmail, UserType.DOCTOR, "Test Doctor");
        if (docUser != null) {
            createDoctorProfile(docUser);
        }

        // 3. ADMIN
        String adminUid = "test-uid-admin";
        String adminEmail = "admin@test.com";
        createFirebaseAccount(adminUid, adminEmail, "Password@123", "Test Admin");
        createDatabaseUser(adminUid, adminEmail, UserType.ADMIN, "Test Admin");

        // 4. SUPER_ADMIN
        String superAdminUid = "test-uid-super-admin";
        String superAdminEmail = "super_admin@test.com";
        createFirebaseAccount(superAdminUid, superAdminEmail, "Password@123", "Test Super Admin");
        
        System.out.println("Attempting to insert SUPER_ADMIN user into the database...");
        createDatabaseUser(superAdminUid, superAdminEmail, UserType.SUPER_ADMIN, "Test Super Admin");
        System.out.println("SUCCESSFULLY inserted SUPER_ADMIN into database!");
        
        System.out.println("=== SEEDING WORKFLOW FINISHED ===");
    }

    private void createFirebaseAccount(String uid, String email, String password, String displayName) {
        try {
            UserRecord userRecord = firebaseAuth.getUser(uid);
            System.out.println("Firebase Auth: User already exists - Email: " + userRecord.getEmail() + " | UID: " + uid);
        } catch (FirebaseAuthException e) {
            try {
                UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                        .setUid(uid)
                        .setEmail(email)
                        .setPassword(password)
                        .setDisplayName(displayName);
                UserRecord userRecord = firebaseAuth.createUser(request);
                System.out.println("Firebase Auth: Successfully created user - Email: " + userRecord.getEmail() + " | UID: " + uid);
            } catch (FirebaseAuthException ex) {
                System.err.println("Firebase Auth Error creating user: " + ex.getMessage());
            }
        }
    }

    private User createDatabaseUser(String uid, String email, UserType role, String displayName) {
        Optional<User> existing = userRepository.findByFirebaseUid(uid);
        if (existing.isPresent()) {
            System.out.println("Database: User already exists - Email: " + existing.get().getEmail() + " | Role: " + existing.get().getUserType());
            return existing.get();
        }
        
        User user = new User();
        user.setFirebaseUid(uid);
        user.setEmail(email);
        user.setUserType(role);
        user.setFullName(displayName);
        user.setWelcomeEmailSent(true); // Don't trigger welcome emails during seeding
        User saved = userRepository.save(user);
        System.out.println("Database: Successfully created user - Email: " + saved.getEmail() + " | Role: " + saved.getUserType());
        return saved;
    }

    private void createDoctorProfile(User user) {
        Optional<Doctor> existing = doctorRepository.findByUserId(user.getId());
        if (existing.isPresent()) {
            System.out.println("Database: Doctor profile already exists for " + user.getFullName());
            return;
        }
        
        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setSpecialization("General Physician");
        doctor.setMedicalLicense("LIC-TEST-12345");
        doctor.setQualification("MBBS, MD");
        doctor.setExperienceYears(10);
        doctor.setConsultationFee(BigDecimal.valueOf(500.00));
        doctor.setRating(5.0);
        doctor.setTotalConsultations(0);
        doctor.setCity("Amritsar");
        doctor.setClinicName("Altruist Test Clinic");
        doctor.setClinicAddress("123 Test Street, Amritsar");
        doctor.setIsVerified(true);
        doctor.setIsAvailable(true);
        doctor.setLanguages("English, Hindi");
        doctorRepository.save(doctor);
        System.out.println("Database: Created Doctor Profile for " + user.getFullName());
    }
}
