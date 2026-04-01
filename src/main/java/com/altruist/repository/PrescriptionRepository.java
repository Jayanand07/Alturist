package com.altruist.repository;

import com.altruist.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    List<Prescription> findByPatientId(UUID patientId);

    long countByPatientId(UUID patientId);

    List<Prescription> findByDoctorId(UUID doctorId);

    List<Prescription> findByConsultationId(UUID consultationId);
}
