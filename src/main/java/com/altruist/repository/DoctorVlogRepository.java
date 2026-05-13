package com.altruist.repository;

import com.altruist.model.DoctorVlog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorVlogRepository extends JpaRepository<DoctorVlog, UUID> {
    List<DoctorVlog> findByDoctorId(UUID doctorId);
    List<DoctorVlog> findByIsPublishedTrue();
    List<DoctorVlog> findByIsPublishedTrueAndCategory(String category);
}
