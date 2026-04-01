package com.altruist.service;

import com.altruist.dto.*;
import com.altruist.model.Doctor;
import com.altruist.model.User;
import com.altruist.model.ConsultationStatus;
import com.altruist.model.UserType;
import com.altruist.repository.ConsultationRepository;
import com.altruist.repository.DoctorRepository;
import com.altruist.repository.UserRepository;
import com.altruist.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional(readOnly = true)
    public AdminDashboardDTO getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();

        // 1. Stats
        AdminDashboardDTO.StatsDTO stats = AdminDashboardDTO.StatsDTO.builder()
                .totalDoctors(doctorRepository.count())
                .totalPatients(userRepository.countByUserType(UserType.PATIENT))
                .todayConsultations(consultationRepository.countByScheduledAtBetween(startOfDay, endOfDay))
                .monthlyRevenue(consultationRepository.sumAmountByStatusAndDateAfter(ConsultationStatus.COMPLETED, startOfMonth))
                .build();

        if (stats.getMonthlyRevenue() == null) {
            stats.setMonthlyRevenue(BigDecimal.ZERO);
        }

        // 2. Recent Consultations
        List<AdminDashboardDTO.RecentConsultationDTO> consultations = consultationRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(c -> AdminDashboardDTO.RecentConsultationDTO.builder()
                        .id(c.getId())
                        .patientName(c.getPatient().getFullName())
                        .doctorName("Dr. " + c.getDoctor().getUser().getFullName())
                        .scheduledAt(c.getScheduledAt())
                        .status(c.getStatus().name())
                        .amount(c.getAmount() != null ? c.getAmount() : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());

        // 3. Recent Users
        List<AdminDashboardDTO.RecentUserDTO> users = userRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(u -> AdminDashboardDTO.RecentUserDTO.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .userType(u.getUserType().name())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return AdminDashboardDTO.builder()
                .stats(stats)
                .recentConsultations(consultations != null ? consultations : new ArrayList<>())
                .recentUsers(users != null ? users : new ArrayList<>())
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getConsultationStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();
        LocalDateTime endOfMonth = firstDayOfMonth.plusMonths(1).minusDays(1).atTime(LocalTime.MAX);

        long total = consultationRepository.count();
        long todayCount = consultationRepository.countByScheduledAtBetween(startOfDay, endOfDay);
        long ongoingCount = consultationRepository.countByStatus(ConsultationStatus.ONGOING);
        long completedThisMonth = consultationRepository.countByStatusAndScheduledAtBetween(ConsultationStatus.COMPLETED, startOfMonth, endOfMonth);
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("today", todayCount);
        stats.put("ongoing", ongoingCount);
        stats.put("completedThisMonth", completedThisMonth);
        
        return stats;
    }

    @Transactional(readOnly = true)
    public Page<ConsultationAdminDTO> getAdminConsultations(String search, ConsultationStatus status, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return consultationRepository.findAdminConsultations(
                search == null || search.trim().isEmpty() ? null : search.trim(),
                status,
                from,
                to,
                pageable
        ).map(c -> ConsultationAdminDTO.builder()
                .id(c.getId())
                .patientName(c.getPatient().getFullName())
                .patientEmail(c.getPatient().getEmail())
                .doctorName(c.getDoctor().getUser().getFullName())
                .doctorSpecialization(c.getDoctor().getSpecialization())
                .scheduledAt(c.getScheduledAt())
                .consultationType(c.getConsultationType())
                .status(c.getStatus())
                .paymentStatus(c.getPaymentStatus())
                .amount(c.getAmount())
                .videoRoomId(c.getVideoRoomId())
                .prescriptionUrl(c.getPrescriptionUrl())
                .createdAt(c.getCreatedAt())
                .callStartedAt(c.getCallStartedAt())
                .callEndedAt(c.getCallEndedAt())
                .callDurationMinutes(c.getCallDurationMinutes())
                .build());
    }

    @Transactional(readOnly = true)
    public Page<DoctorListDTO> getAdminDoctors(String search, String specialization, Boolean available, Pageable pageable) {
        return doctorRepository.findAdminDoctors(search, specialization, available, pageable)
                .map(DoctorMapper::toListDTO);
    }

    @Transactional
    public DoctorListDTO createDoctor(AdminDoctorRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }

        // 1. Create User
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setUserType(UserType.DOCTOR);
        // Temporary Firebase UID for manual creation (Admin Panel)
        user.setFirebaseUid("ADMIN_CREATED_" + UUID.randomUUID().toString());
        User savedUser = userRepository.save(user);

        // 2. Create Doctor
        Doctor doctor = new Doctor();
        doctor.setUser(savedUser);
        doctor.setSpecialization(request.getSpecialization());
        doctor.setMedicalLicense(request.getMedicalLicense());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setQualification(request.getQualification());
        doctor.setIsAvailable(true);
        doctor.setRating(5.0); // New doctors start with 5 stars
        doctor = doctorRepository.save(doctor);

        return DoctorMapper.toListDTO(doctor);
    }

    @Transactional
    public DoctorListDTO updateDoctor(UUID id, AdminDoctorRequestDTO request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        User user = doctor.getUser();

        // Update User
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        userRepository.save(user);

        // Update Doctor
        doctor.setSpecialization(request.getSpecialization());
        doctor.setMedicalLicense(request.getMedicalLicense());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setQualification(request.getQualification());
        doctor = doctorRepository.save(doctor);

        return DoctorMapper.toListDTO(doctor);
    }

    @Transactional
    public void toggleDoctorAvailability(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setIsAvailable(!doctor.getIsAvailable());
        doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        long consultationCount = consultationRepository.countByDoctorId(doctor.getId());
        if (consultationCount > 0) {
            throw new RuntimeException("409: Cannot delete doctor with existing consultations.");
        }

        User user = doctor.getUser();
        doctorRepository.delete(doctor);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public Page<PatientListDTO> getPatients(String search, Pageable pageable) {
        return userRepository.searchPatients(search, pageable)
                .map(u -> PatientListDTO.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .gender(u.getGender())
                        .dateOfBirth(u.getDateOfBirth())
                        .createdAt(u.getCreatedAt())
                        .totalConsultations(consultationRepository.countByPatientId(u.getId()))
                        .build());
    }

    @Transactional(readOnly = true)
    public PatientDetailDTO getPatientDetails(UUID id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        List<PatientDetailDTO.RecentConsultationDTO> consultations = consultationRepository.findTop5ByPatientIdOrderByCreatedAtDesc(u.getId())
                .stream()
                .map(c -> PatientDetailDTO.RecentConsultationDTO.builder()
                        .id(c.getId())
                        .doctorName("Dr. " + c.getDoctor().getUser().getFullName())
                        .specialization(c.getDoctor().getSpecialization())
                        .scheduledAt(c.getScheduledAt())
                        .status(c.getStatus().name())
                        .amount(c.getAmount())
                        .build())
                .collect(Collectors.toList());

        return PatientDetailDTO.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .gender(u.getGender())
                .dateOfBirth(u.getDateOfBirth())
                .createdAt(u.getCreatedAt())
                .totalConsultations(consultationRepository.countByPatientId(u.getId()))
                .prescriptionCount(prescriptionRepository.countByPatientId(u.getId()))
                .recentConsultations(consultations)
                .build();
    }

    @Transactional
    public void deletePatient(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        long activeConsultations = consultationRepository.countByPatientIdAndStatus(user.getId(), ConsultationStatus.ONGOING);
        if (activeConsultations > 0) {
            throw new RuntimeException("409: Cannot delete patient with active consultations.");
        }

        userRepository.delete(user);
    }
}
