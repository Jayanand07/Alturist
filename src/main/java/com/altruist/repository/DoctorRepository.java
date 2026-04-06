package com.altruist.repository;

import com.altruist.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUserId(UUID userId);

    Optional<Doctor> findByMedicalLicense(String medicalLicense);

    List<Doctor> findBySpecialization(String specialization);

    List<Doctor> findByIsAvailableTrue();

    List<Doctor> findBySpecializationAndIsAvailableTrue(String specialization);

    @EntityGraph(attributePaths = {"user"})
    Page<Doctor> findByIsAvailableTrueOrderByRatingDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT d FROM Doctor d WHERE (:specialization = '' OR d.specialization = :specialization) " +
           "AND (:minFee IS NULL OR d.consultationFee >= :minFee) " +
           "AND (:maxFee IS NULL OR d.consultationFee <= :maxFee) " +
           "AND d.isAvailable = true " +
           "ORDER BY d.rating DESC")
    Page<Doctor> findAvailableWithFilters(
            @Param("specialization") String specialization,
            @Param("minFee") Double minFee,
            @Param("maxFee") Double maxFee,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT d FROM Doctor d WHERE " +
           "(:search = '' OR LOWER(d.user.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:specialization = '' OR d.specialization = :specialization) AND " +
           "(:available IS NULL OR d.isAvailable = :available)")
    Page<Doctor> findAdminDoctors(
            @Param("search") String search,
            @Param("specialization") String specialization,
            @Param("available") Boolean available,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT d FROM Doctor d WHERE d.id = :id")
    Optional<Doctor> findByIdWithUser(@Param("id") UUID id);
}
