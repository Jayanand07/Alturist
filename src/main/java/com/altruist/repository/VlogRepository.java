package com.altruist.repository;

import com.altruist.model.Vlog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VlogRepository extends JpaRepository<Vlog, UUID> {
    List<Vlog> findByDoctorId(UUID doctorId);
    List<Vlog> findByIsPublishedTrueOrderByPublishedAtDesc();
    List<Vlog> findByIsPublishedTrueAndCategoryOrderByPublishedAtDesc(String category);
}
