package com.altruist.repository;

import com.altruist.model.LabBooking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LabBookingRepository extends JpaRepository<LabBooking, UUID> {
    
    List<LabBooking> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    @Query("SELECT b FROM LabBooking b " +
           "WHERE (:status IS NULL OR b.status = :status) " +
           "AND (:search IS NULL OR LOWER(b.patient.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.phone) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<LabBooking> findAdminBookings(@Param("status") String status, 
                                      @Param("search") String search, 
                                      Pageable pageable);
}
