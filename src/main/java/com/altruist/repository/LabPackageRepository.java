package com.altruist.repository;

import com.altruist.model.LabPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LabPackageRepository extends JpaRepository<LabPackage, UUID> {
    List<LabPackage> findByIsActiveTrueOrderByCreatedAtDesc();
    List<LabPackage> findAllByOrderByCreatedAtDesc();
}
