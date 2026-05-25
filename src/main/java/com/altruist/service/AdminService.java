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
    private final com.altruist.repository.MedicineRepository medicineRepository;

    @Transactional(readOnly = true)
    public AdminDashboardDTO getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX.withHour(23).withMinute(59).withSecond(59).withNano(999999999));
        
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
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX.withHour(23).withMinute(59).withSecond(59).withNano(999999999));
        
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
        return doctorRepository.findAdminDoctors(
                search == null || search.trim().isEmpty() ? "" : search.trim(),
                specialization == null || specialization.trim().isEmpty() ? "" : specialization, 
                available, 
                pageable)
                .map(DoctorMapper::toListDTO);
    }

    @Transactional
    public DoctorListDTO createDoctor(AdminDoctorRequestDTO request) {
        if (request.getFirebaseUid() == null || request.getFirebaseUid().isBlank()) {
            throw new IllegalArgumentException("Firebase UID is required to create a doctor account");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }

        // 1. Create User
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setUserType(UserType.DOCTOR);
        user.setFirebaseUid(request.getFirebaseUid());
        User savedUser = userRepository.save(user);

        // 2. Create Doctor
        Doctor doctor = new Doctor();
        doctor.setUser(savedUser);
        doctor.setIsAvailable(true);
        doctor.setRating(5.0); // New doctors start with 5 stars
        DoctorMapper.updateDoctorFromRequest(doctor, request);
        doctor = doctorRepository.save(doctor);

        return DoctorMapper.toListDTO(doctor);
    }

    @Transactional
    public DoctorListDTO updateDoctor(UUID id, AdminDoctorRequestDTO request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        User user = doctor.getUser();

        // Update User
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        userRepository.save(user);

        // Update Doctor
        DoctorMapper.updateDoctorFromRequest(doctor, request);
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
    @Transactional(readOnly = true)
    public DoctorDetailDTO adminGetDoctorDetail(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return DoctorMapper.toDetailDTO(doctor);
    }

    @Transactional
    public DoctorDetailDTO adminUpdateDoctor(UUID doctorId, AdminDoctorRequestDTO dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        User user = doctor.getUser();

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        userRepository.save(user);

        DoctorMapper.updateDoctorFromRequest(doctor, dto);
        doctor = doctorRepository.save(doctor);

        return DoctorMapper.toDetailDTO(doctor);
    }

    @Transactional
    public void adminDeleteDoctor(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        User user = doctor.getUser();
        
        prescriptionRepository.deleteAll(prescriptionRepository.findByDoctorId(doctor.getId()));
        consultationRepository.deleteAll(consultationRepository.findByDoctorId(doctor.getId()));
        
        doctorRepository.delete(doctor);
        userRepository.delete(user);
    }

    @Transactional
    public void adminToggleDoctorVerification(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setIsVerified(!Boolean.TRUE.equals(doctor.getIsVerified()));
        doctorRepository.save(doctor);
    }

    @Transactional(readOnly = true)
    public PatientDetailDTO adminGetPatientDetail(UUID userId) {
        return getPatientDetails(userId);
    }

    @Transactional
    public PatientDetailDTO adminUpdatePatient(UUID userId, PatientProfileDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getGender() != null) user.setGender(dto.getGender());
        if (dto.getDateOfBirth() != null && !dto.getDateOfBirth().isBlank()) user.setDateOfBirth(java.time.LocalDate.parse(dto.getDateOfBirth()));
        if (dto.getBloodGroup() != null) user.setBloodGroup(dto.getBloodGroup());
        
        userRepository.save(user);
        return getPatientDetails(userId);
    }

    @Transactional
    public void adminDeletePatient(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        prescriptionRepository.deleteAll(prescriptionRepository.findByPatientId(user.getId()));
        consultationRepository.deleteAll(consultationRepository.findByPatientId(user.getId()));
        userRepository.delete(user);
    }

    @Transactional
    public com.altruist.dto.MedicineDTO adminCreateMedicine(com.altruist.dto.MedicineDTO dto) {
        com.altruist.model.Medicine medicine = new com.altruist.model.Medicine();
        medicine.setName(dto.getName());
        medicine.setGenericName(dto.getGenericName());
        medicine.setManufacturer(dto.getManufacturer());
        medicine.setCategory(dto.getCategory());
        medicine.setPrice(dto.getPrice());
        medicine.setDiscountedPrice(dto.getDiscountedPrice());
        medicine.setStockQuantity(dto.getStockQuantity());
        if (dto.getRequiresPrescription() != null) medicine.setRequiresPrescription(dto.getRequiresPrescription());
        if (dto.getInStock() != null) medicine.setInStock(dto.getInStock());
        medicine.setDescription(dto.getDescription());
        medicine.setImageUrl(dto.getImageUrl());
        medicine = medicineRepository.save(medicine);
        dto.setId(medicine.getId());
        return dto;
    }

    @Transactional
    public com.altruist.dto.MedicineDTO adminUpdateMedicine(UUID medicineId, com.altruist.dto.MedicineDTO dto) {
        com.altruist.model.Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        if (dto.getName() != null) medicine.setName(dto.getName());
        if (dto.getGenericName() != null) medicine.setGenericName(dto.getGenericName());
        if (dto.getManufacturer() != null) medicine.setManufacturer(dto.getManufacturer());
        if (dto.getCategory() != null) medicine.setCategory(dto.getCategory());
        if (dto.getPrice() != null) medicine.setPrice(dto.getPrice());
        medicine.setDiscountedPrice(dto.getDiscountedPrice()); // Can be null
        if (dto.getStockQuantity() != null) medicine.setStockQuantity(dto.getStockQuantity());
        if (dto.getRequiresPrescription() != null) medicine.setRequiresPrescription(dto.getRequiresPrescription());
        if (dto.getInStock() != null) medicine.setInStock(dto.getInStock());
        if (dto.getDescription() != null) medicine.setDescription(dto.getDescription());
        if (dto.getImageUrl() != null) medicine.setImageUrl(dto.getImageUrl());
        medicine = medicineRepository.save(medicine);
        dto.setId(medicine.getId());
        return dto;
    }

    @Transactional
    public void adminDeleteMedicine(UUID medicineId) {
        medicineRepository.deleteById(medicineId);
    }

    @Transactional
    public Map<String, Object> adminPromoteUser(UUID userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUserType(UserType.valueOf(newRole));
        userRepository.save(user);
        return Map.of("id", user.getId(), "role", user.getUserType().name());
    }

    @Transactional
    public void adminUpdateSuperAdmin(UUID userId, Map<String,Object> changes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (changes.containsKey("fullName")) user.setFullName((String) changes.get("fullName"));
        if (changes.containsKey("userType")) {
            user.setUserType(UserType.valueOf((String) changes.get("userType")));
        }
        userRepository.save(user);
    }
}
