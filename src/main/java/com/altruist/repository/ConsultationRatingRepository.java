package com.altruist.repository;

import com.altruist.model.ConsultationRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsultationRatingRepository extends JpaRepository<ConsultationRating, UUID> {

    @Query(value = "SELECT AVG(rating) FROM consultation_ratings WHERE doctor_id = :doctorId", nativeQuery = true)
    Double getAverageRatingByDoctorId(UUID doctorId);

    Optional<ConsultationRating> findByConsultationId(UUID consultationId);
}
