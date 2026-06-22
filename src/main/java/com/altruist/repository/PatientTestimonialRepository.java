package com.altruist.repository;

import com.altruist.model.PatientTestimonial;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientTestimonialRepository extends JpaRepository<PatientTestimonial, UUID> {

    @Query("SELECT t FROM PatientTestimonial t WHERE t.isApproved = true AND (:featured IS NULL OR t.isFeatured = :featured)")
    List<PatientTestimonial> findTestimonials(@Param("featured") Boolean featured, Pageable pageable);
}
