package com.altruist.repository;

import com.altruist.model.Consultation;
import com.altruist.model.ConsultationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, UUID>, JpaSpecificationExecutor<Consultation> {

    @Query(value = "SELECT COUNT(*) FROM consultations WHERE doctor_id = :doctorId AND scheduled_at >= :start AND scheduled_at <= :end", nativeQuery = true)
    Long countTodaysConsultations(@Param("doctorId") UUID doctorId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM consultations WHERE doctor_id = :doctorId AND status = 'COMPLETED' AND scheduled_at >= :monthStart AND scheduled_at < :monthEnd", nativeQuery = true)
    java.math.BigDecimal calculateMonthlyEarningsRange(@Param("doctorId") UUID doctorId, @Param("monthStart") LocalDateTime monthStart, @Param("monthEnd") LocalDateTime monthEnd);

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM consultations WHERE doctor_id = :doctorId AND status = 'COMPLETED' AND scheduled_at >= :monthStart", nativeQuery = true)
    java.math.BigDecimal calculateMonthlyEarnings(@Param("doctorId") UUID doctorId, @Param("monthStart") LocalDateTime monthStart);

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM consultations WHERE doctor_id = :doctorId AND status = 'COMPLETED'", nativeQuery = true)
    java.math.BigDecimal calculateTotalEarnings(@Param("doctorId") UUID doctorId);

    @Query(value = "SELECT COALESCE(AVG(amount), 0) FROM consultations WHERE doctor_id = :doctorId AND status = 'COMPLETED'", nativeQuery = true)
    java.math.BigDecimal calculateAverageEarningsPerConsultation(@Param("doctorId") UUID doctorId);

    @Query(value = "SELECT TO_CHAR(scheduled_at, 'Mon') as month, COALESCE(SUM(amount), 0) as amount " +
                   "FROM consultations " +
                   "WHERE doctor_id = :doctorId AND status = 'COMPLETED' " +
                   "AND scheduled_at >= CURRENT_DATE - INTERVAL '5 months' " +
                   "GROUP BY TO_CHAR(scheduled_at, 'Mon'), EXTRACT(MONTH FROM scheduled_at), EXTRACT(YEAR FROM scheduled_at) " +
                   "ORDER BY EXTRACT(YEAR FROM scheduled_at), EXTRACT(MONTH FROM scheduled_at)", nativeQuery = true)
    List<Object[]> getMonthlyEarningsData(@Param("doctorId") UUID doctorId);

    @Query(value = "SELECT COUNT(DISTINCT patient_id) FROM consultations WHERE doctor_id = :doctorId", nativeQuery = true)
    Long countTotalUniquePatients(@Param("doctorId") UUID doctorId);

    @Query("SELECT c FROM Consultation c WHERE c.consultationType = 'INSTANT' AND c.status = 'PENDING' AND (c.doctor.id IS NULL OR c.doctor.id = :doctorId) ORDER BY c.createdAt ASC")
    List<Consultation> findPendingInstantQueue(@Param("doctorId") UUID doctorId);

    List<Consultation> findByPatientId(UUID patientId);

    List<Consultation> findByDoctorId(UUID doctorId);

    List<Consultation> findByPatientIdAndStatus(UUID patientId, ConsultationStatus status);

    List<Consultation> findByDoctorIdAndStatus(UUID doctorId, ConsultationStatus status);

    List<Consultation> findByStatus(ConsultationStatus status);

    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient"})
    List<Consultation> findByPatientIdAndScheduledAtBetweenOrderByScheduledAtAsc(UUID patientId, java.time.LocalDateTime start, java.time.LocalDateTime end);

    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient"})
    List<Consultation> findByDoctorIdAndScheduledAtBetweenOrderByScheduledAtAsc(UUID doctorId, java.time.LocalDateTime start, java.time.LocalDateTime end);

    long countByScheduledAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(c.amount) FROM Consultation c WHERE c.status = :status AND c.scheduledAt >= :after")
    java.math.BigDecimal sumAmountByStatusAndDateAfter(@Param("status") ConsultationStatus status, @Param("after") LocalDateTime after);

    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient"})
    List<Consultation> findTop10ByOrderByCreatedAtDesc();

    long countByDoctorId(UUID doctorId);

    long countByPatientId(UUID patientId);

    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient"})
    List<Consultation> findByPatientIdOrderByScheduledAtDesc(UUID patientId);

    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient"})
    List<Consultation> findByDoctorIdAndIsRescheduleRequestedTrue(UUID doctorId);

    long countByPatientIdAndStatus(UUID patientId, ConsultationStatus status);

    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient"})
    List<Consultation> findTop5ByPatientIdOrderByCreatedAtDesc(UUID patientId);

    @Query("SELECT c FROM Consultation c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(CAST(:dateFrom AS timestamp) IS NULL OR c.scheduledAt >= :dateFrom) AND " +
           "(CAST(:dateTo AS timestamp) IS NULL OR c.scheduledAt <= :dateTo) AND " +
           "(:search IS NULL OR LOWER(c.patient.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.doctor.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    @EntityGraph(attributePaths = {"doctor", "doctor.user", "patient"})
    org.springframework.data.domain.Page<Consultation> findAdminConsultations(
            @Param("search") String search,
            @Param("status") ConsultationStatus status,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            org.springframework.data.domain.Pageable pageable);

    long countByStatus(ConsultationStatus status);

    long countByStatusAndScheduledAtBetween(ConsultationStatus status, LocalDateTime start, LocalDateTime end);
}
