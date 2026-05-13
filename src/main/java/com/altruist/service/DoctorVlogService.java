package com.altruist.service;

import com.altruist.dto.DoctorVlogDTO;
import com.altruist.dto.DoctorVlogRequestDTO;
import com.altruist.exception.UnauthorizedException;
import com.altruist.model.Doctor;
import com.altruist.model.DoctorVlog;
import com.altruist.repository.DoctorRepository;
import com.altruist.repository.DoctorVlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorVlogService {

    private final DoctorVlogRepository vlogRepository;
    private final DoctorRepository doctorRepository;

    @Cacheable(value = "publishedVlogs", key = "#category ?: 'all'")
    public List<DoctorVlogDTO> getPublishedVlogs(String category) {
        List<DoctorVlog> vlogs;
        if (category != null && !category.trim().isEmpty()) {
            vlogs = vlogRepository.findByIsPublishedTrueAndCategory(category);
        } else {
            vlogs = vlogRepository.findByIsPublishedTrue();
        }
        return vlogs.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DoctorVlogDTO getVlogById(UUID vlogId) {
        DoctorVlog vlog = vlogRepository.findById(vlogId)
                .orElseThrow(() -> new RuntimeException("Vlog not found"));
        return toDTO(vlog);
    }

    public List<DoctorVlogDTO> getDoctorVlogs(UUID doctorId) {
        return vlogRepository.findByDoctorId(doctorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public DoctorVlogDTO createVlog(UUID doctorId, DoctorVlogRequestDTO dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        DoctorVlog vlog = new DoctorVlog();
        vlog.setDoctor(doctor);
        vlog.setTitle(dto.getTitle());
        vlog.setDescription(dto.getDescription());
        vlog.setVideoUrl(dto.getVideoUrl());
        vlog.setThumbnailUrl(dto.getThumbnailUrl());
        vlog.setCategory(dto.getCategory());
        vlog.setIsPublished(false);
        vlog.setViewCount(0);

        return toDTO(vlogRepository.save(vlog));
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public DoctorVlogDTO updateVlog(UUID vlogId, UUID doctorId, DoctorVlogRequestDTO dto) {
        DoctorVlog vlog = getAndValidateOwnership(vlogId, doctorId);

        if (dto.getTitle() != null) vlog.setTitle(dto.getTitle());
        if (dto.getDescription() != null) vlog.setDescription(dto.getDescription());
        if (dto.getVideoUrl() != null) vlog.setVideoUrl(dto.getVideoUrl());
        if (dto.getThumbnailUrl() != null) vlog.setThumbnailUrl(dto.getThumbnailUrl());
        if (dto.getCategory() != null) vlog.setCategory(dto.getCategory());

        return toDTO(vlogRepository.save(vlog));
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public void publishVlog(UUID vlogId, UUID doctorId) {
        DoctorVlog vlog = getAndValidateOwnership(vlogId, doctorId);
        vlog.setIsPublished(true);
        vlog.setPublishedAt(LocalDateTime.now());
        vlogRepository.save(vlog);
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public void unpublishVlog(UUID vlogId, UUID doctorId) {
        DoctorVlog vlog = getAndValidateOwnership(vlogId, doctorId);
        vlog.setIsPublished(false);
        vlog.setPublishedAt(null);
        vlogRepository.save(vlog);
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public void deleteVlog(UUID vlogId, UUID doctorId) {
        DoctorVlog vlog = getAndValidateOwnership(vlogId, doctorId);
        vlogRepository.delete(vlog);
    }

    @Transactional
    public DoctorVlogDTO incrementView(UUID vlogId) {
        DoctorVlog vlog = vlogRepository.findById(vlogId)
                .orElseThrow(() -> new RuntimeException("Vlog not found"));
        vlog.setViewCount(vlog.getViewCount() + 1);
        return toDTO(vlogRepository.save(vlog));
    }

    public List<DoctorVlogDTO> adminGetAllVlogs() {
        return vlogRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private DoctorVlog getAndValidateOwnership(UUID vlogId, UUID doctorId) {
        DoctorVlog vlog = vlogRepository.findById(vlogId)
                .orElseThrow(() -> new RuntimeException("Vlog not found"));
        
        if (!vlog.getDoctor().getId().equals(doctorId)) {
            throw new UnauthorizedException("You are not authorized to modify this vlog");
        }
        return vlog;
    }

    private DoctorVlogDTO toDTO(DoctorVlog vlog) {
        Doctor doctor = vlog.getDoctor();
        String doctorName = (doctor != null && doctor.getUser() != null) ? doctor.getUser().getFullName() : null;
        String doctorSpecialization = doctor != null ? doctor.getSpecialization() : null;
        String doctorCity = doctor != null ? doctor.getCity() : null;

        return new DoctorVlogDTO(
                vlog.getId(), vlog.getTitle(), vlog.getDescription(),
                vlog.getVideoUrl(), vlog.getThumbnailUrl(), vlog.getCategory(),
                vlog.getIsPublished(), vlog.getViewCount(), vlog.getPublishedAt(),
                vlog.getCreatedAt(), vlog.getUpdatedAt(),
                doctorName, doctorSpecialization, doctorCity
        );
    }
}
