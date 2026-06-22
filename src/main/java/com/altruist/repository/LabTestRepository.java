package com.altruist.repository;

import com.altruist.model.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, UUID> {
    List<LabTest> findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();
    List<LabTest> findAllByOrderByCreatedAtDesc();
}
