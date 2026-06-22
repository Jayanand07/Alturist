package com.altruist.service;

import com.altruist.dto.LabPackageDTO;
import com.altruist.dto.LabTestDTO;
import com.altruist.model.LabPackage;
import com.altruist.model.LabTest;
import com.altruist.repository.LabPackageRepository;
import com.altruist.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabService {

    private final LabTestRepository labTestRepository;
    private final LabPackageRepository labPackageRepository;

    // --- LAB TEST SERVICE METHODS ---

    @Transactional(readOnly = true)
    public List<LabTestDTO> getFeaturedTests() {
        return labTestRepository.findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToTestDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabTestDTO> getAllTests() {
        return labTestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToTestDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabTestDTO createLabTest(LabTestDTO dto) {
        LabTest labTest = LabTest.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .price(dto.getPrice())
                .discountedPrice(dto.getDiscountedPrice())
                .discountPercent(dto.getDiscountPercent())
                .includesCount(dto.getIncludesCount())
                .isFeatured(Boolean.TRUE.equals(dto.getIsFeatured()))
                .isActive(dto.getIsActive() == null || Boolean.TRUE.equals(dto.getIsActive()))
                .parametersIncluded(dto.getParametersIncluded())
                .reportTimeHours(dto.getReportTimeHours())
                .freeHomeCollection(Boolean.TRUE.equals(dto.getFreeHomeCollection()))
                .build();

        return mapToTestDTO(labTestRepository.save(labTest));
    }

    @Transactional
    public LabTestDTO updateLabTest(UUID id, LabTestDTO dto) {
        LabTest labTest = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab Test not found with id: " + id));

        labTest.setName(dto.getName());
        labTest.setDescription(dto.getDescription());
        labTest.setCategory(dto.getCategory());
        labTest.setPrice(dto.getPrice());
        labTest.setDiscountedPrice(dto.getDiscountedPrice());
        labTest.setDiscountPercent(dto.getDiscountPercent());
        labTest.setIncludesCount(dto.getIncludesCount());
        labTest.setParametersIncluded(dto.getParametersIncluded());
        labTest.setReportTimeHours(dto.getReportTimeHours());
        if (dto.getFreeHomeCollection() != null) {
            labTest.setFreeHomeCollection(dto.getFreeHomeCollection());
        }
        if (dto.getIsFeatured() != null) {
            labTest.setIsFeatured(dto.getIsFeatured());
        }
        if (dto.getIsActive() != null) {
            labTest.setIsActive(dto.getIsActive());
        }

        return mapToTestDTO(labTestRepository.save(labTest));
    }

    @Transactional
    public void deleteLabTest(UUID id) {
        if (!labTestRepository.existsById(id)) {
            throw new RuntimeException("Lab Test not found with id: " + id);
        }
        labTestRepository.deleteById(id);
    }

    // --- LAB PACKAGE SERVICE METHODS ---

    @Transactional(readOnly = true)
    public List<LabPackageDTO> getActivePackages() {
        return labPackageRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToPackageDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabPackageDTO> getAllPackages() {
        return labPackageRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToPackageDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabPackageDTO createLabPackage(LabPackageDTO dto) {
        LabPackage labPackage = LabPackage.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .includesTestCount(dto.getIncludesTestCount())
                .testNames(dto.getTestNames())
                .originalPrice(dto.getOriginalPrice())
                .discountedPrice(dto.getDiscountedPrice())
                .discountPercent(dto.getDiscountPercent())
                .smartReportIncluded(Boolean.TRUE.equals(dto.getSmartReportIncluded()))
                .isActive(dto.getIsActive() == null || Boolean.TRUE.equals(dto.getIsActive()))
                .build();

        return mapToPackageDTO(labPackageRepository.save(labPackage));
    }

    @Transactional
    public LabPackageDTO updateLabPackage(UUID id, LabPackageDTO dto) {
        LabPackage labPackage = labPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab Package not found with id: " + id));

        labPackage.setName(dto.getName());
        labPackage.setDescription(dto.getDescription());
        labPackage.setIncludesTestCount(dto.getIncludesTestCount());
        labPackage.setTestNames(dto.getTestNames());
        labPackage.setOriginalPrice(dto.getOriginalPrice());
        labPackage.setDiscountedPrice(dto.getDiscountedPrice());
        labPackage.setDiscountPercent(dto.getDiscountPercent());
        if (dto.getSmartReportIncluded() != null) {
            labPackage.setSmartReportIncluded(dto.getSmartReportIncluded());
        }
        if (dto.getIsActive() != null) {
            labPackage.setIsActive(dto.getIsActive());
        }

        return mapToPackageDTO(labPackageRepository.save(labPackage));
    }

    @Transactional
    public void deleteLabPackage(UUID id) {
        if (!labPackageRepository.existsById(id)) {
            throw new RuntimeException("Lab Package not found with id: " + id);
        }
        labPackageRepository.deleteById(id);
    }

    // --- MAPPER HELPERS ---

    private LabTestDTO mapToTestDTO(LabTest test) {
        return LabTestDTO.builder()
                .id(test.getId())
                .name(test.getName())
                .description(test.getDescription())
                .category(test.getCategory())
                .price(test.getPrice())
                .discountedPrice(test.getDiscountedPrice())
                .discountPercent(test.getDiscountPercent())
                .includesCount(test.getIncludesCount())
                .isFeatured(test.getIsFeatured())
                .isActive(test.getIsActive())
                .parametersIncluded(test.getParametersIncluded())
                .reportTimeHours(test.getReportTimeHours())
                .freeHomeCollection(test.getFreeHomeCollection())
                .build();
    }

    private LabPackageDTO mapToPackageDTO(LabPackage pkg) {
        return LabPackageDTO.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .includesTestCount(pkg.getIncludesTestCount())
                .testNames(pkg.getTestNames())
                .originalPrice(pkg.getOriginalPrice())
                .discountedPrice(pkg.getDiscountedPrice())
                .discountPercent(pkg.getDiscountPercent())
                .smartReportIncluded(pkg.getSmartReportIncluded())
                .isActive(pkg.getIsActive())
                .build();
    }
}
