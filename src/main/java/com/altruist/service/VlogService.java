package com.altruist.service;

import com.altruist.dto.VlogDTO;
import com.altruist.dto.VlogRequestDTO;
import com.altruist.exception.UnauthorizedException;
import com.altruist.model.Doctor;
import com.altruist.model.Vlog;
import com.altruist.repository.DoctorRepository;
import com.altruist.repository.VlogRepository;
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
public class VlogService {

    private final VlogRepository vlogRepository;
    private final DoctorRepository doctorRepository;

    @Cacheable(value = "publishedVlogs", key = "#category ?: 'all'")
    public List<VlogDTO> getPublishedVlogs(String category) {
        List<Vlog> vlogs;
        if (category != null && !category.trim().isEmpty()) {
            vlogs = vlogRepository.findByIsPublishedTrueAndCategoryOrderByPublishedAtDesc(category);
        } else {
            vlogs = vlogRepository.findByIsPublishedTrueOrderByPublishedAtDesc();
        }
        return vlogs.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public VlogDTO getPublishedVlogByIdAndIncrementViews(UUID vlogId) {
        Vlog vlog = vlogRepository.findById(vlogId)
                .orElseThrow(() -> new RuntimeException("Vlog not found"));
        if (!vlog.getIsPublished()) {
            throw new RuntimeException("Vlog is not published");
        }
        vlog.setViewsCount(vlog.getViewsCount() + 1);
        return toDTO(vlogRepository.save(vlog));
    }

    public VlogDTO getVlogById(UUID vlogId) {
        Vlog vlog = vlogRepository.findById(vlogId)
                .orElseThrow(() -> new RuntimeException("Vlog not found"));
        return toDTO(vlog);
    }

    public List<VlogDTO> getDoctorVlogs(UUID doctorId) {
        return vlogRepository.findByDoctorId(doctorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public VlogDTO createVlogForDoctor(UUID doctorId, VlogRequestDTO dto) {
        // Enforce thumbnail validation if publishing
        if (Boolean.TRUE.equals(dto.getIsPublished()) && (dto.getThumbnailUrl() == null || dto.getThumbnailUrl().trim().isEmpty())) {
            throw new IllegalArgumentException("Thumbnail is required to publish a vlog.");
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Vlog vlog = new Vlog();
        vlog.setDoctor(doctor);
        vlog.setTitle(dto.getTitle());
        vlog.setExcerpt(dto.getExcerpt());
        vlog.setContent(dto.getContent());
        vlog.setVideoUrl(dto.getVideoUrl());
        vlog.setThumbnailUrl(dto.getThumbnailUrl());
        vlog.setCategory(dto.getCategory());
        vlog.setIsPublished(dto.getIsPublished() != null ? dto.getIsPublished() : false);
        vlog.setIsFeatured(false); // Doctors cannot feature vlogs by default
        vlog.setViewsCount(0);
        if (vlog.getIsPublished()) {
            vlog.setPublishedAt(LocalDateTime.now());
        }

        return toDTO(vlogRepository.save(vlog));
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public VlogDTO updateVlogForDoctor(UUID vlogId, UUID doctorId, VlogRequestDTO dto) {
        Vlog vlog = getAndValidateOwnership(vlogId, doctorId);

        // Enforce thumbnail validation if publishing
        boolean willBePublished = Boolean.TRUE.equals(dto.getIsPublished());
        String finalThumbnail = dto.getThumbnailUrl() != null ? dto.getThumbnailUrl().trim() : (vlog.getThumbnailUrl() != null ? vlog.getThumbnailUrl().trim() : "");
        if (willBePublished && finalThumbnail.isEmpty()) {
            throw new IllegalArgumentException("Thumbnail is required to publish a vlog.");
        }

        if (dto.getTitle() != null) vlog.setTitle(dto.getTitle());
        if (dto.getExcerpt() != null) vlog.setExcerpt(dto.getExcerpt());
        if (dto.getContent() != null) vlog.setContent(dto.getContent());
        if (dto.getVideoUrl() != null) vlog.setVideoUrl(dto.getVideoUrl());
        if (dto.getThumbnailUrl() != null) vlog.setThumbnailUrl(dto.getThumbnailUrl());
        if (dto.getCategory() != null) vlog.setCategory(dto.getCategory());
        
        if (dto.getIsPublished() != null) {
            if (dto.getIsPublished() && !vlog.getIsPublished()) {
                vlog.setPublishedAt(LocalDateTime.now());
            } else if (!dto.getIsPublished() && vlog.getIsPublished()) {
                vlog.setPublishedAt(null);
            }
            vlog.setIsPublished(dto.getIsPublished());
        }

        return toDTO(vlogRepository.save(vlog));
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public void publishVlog(UUID vlogId, UUID doctorId) {
        Vlog vlog = getAndValidateOwnership(vlogId, doctorId);
        if (vlog.getThumbnailUrl() == null || vlog.getThumbnailUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("Thumbnail is required to publish a vlog.");
        }
        vlog.setIsPublished(true);
        vlog.setPublishedAt(LocalDateTime.now());
        vlogRepository.save(vlog);
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public void unpublishVlog(UUID vlogId, UUID doctorId) {
        Vlog vlog = getAndValidateOwnership(vlogId, doctorId);
        vlog.setIsPublished(false);
        vlog.setPublishedAt(null);
        vlogRepository.save(vlog);
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public void deleteVlog(UUID vlogId, UUID doctorId) {
        Vlog vlog = getAndValidateOwnership(vlogId, doctorId);
        vlogRepository.delete(vlog);
    }

    // --- Admin Operations ---

    public List<VlogDTO> adminGetAllVlogs() {
        return vlogRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public VlogDTO adminCreateVlog(VlogRequestDTO dto) {
        if (dto.getAuthorDoctorId() == null) {
            throw new IllegalArgumentException("Author Doctor ID is required.");
        }
        if (Boolean.TRUE.equals(dto.getIsPublished()) && (dto.getThumbnailUrl() == null || dto.getThumbnailUrl().trim().isEmpty())) {
            throw new IllegalArgumentException("Thumbnail is required to publish a vlog.");
        }

        Doctor doctor = doctorRepository.findById(dto.getAuthorDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Vlog vlog = new Vlog();
        vlog.setDoctor(doctor);
        vlog.setTitle(dto.getTitle());
        vlog.setExcerpt(dto.getExcerpt());
        vlog.setContent(dto.getContent());
        vlog.setVideoUrl(dto.getVideoUrl());
        vlog.setThumbnailUrl(dto.getThumbnailUrl());
        vlog.setCategory(dto.getCategory());
        vlog.setIsPublished(dto.getIsPublished() != null ? dto.getIsPublished() : false);
        vlog.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        vlog.setViewsCount(0);
        if (vlog.getIsPublished()) {
            vlog.setPublishedAt(LocalDateTime.now());
        }

        return toDTO(vlogRepository.save(vlog));
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public VlogDTO adminUpdateVlog(UUID vlogId, VlogRequestDTO dto) {
        Vlog vlog = vlogRepository.findById(vlogId)
                .orElseThrow(() -> new RuntimeException("Vlog not found"));

        boolean willBePublished = Boolean.TRUE.equals(dto.getIsPublished());
        String finalThumbnail = dto.getThumbnailUrl() != null ? dto.getThumbnailUrl().trim() : (vlog.getThumbnailUrl() != null ? vlog.getThumbnailUrl().trim() : "");
        if (willBePublished && finalThumbnail.isEmpty()) {
            throw new IllegalArgumentException("Thumbnail is required to publish a vlog.");
        }

        if (dto.getAuthorDoctorId() != null && !dto.getAuthorDoctorId().equals(vlog.getDoctor().getId())) {
            Doctor newDoctor = doctorRepository.findById(dto.getAuthorDoctorId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            vlog.setDoctor(newDoctor);
        }

        if (dto.getTitle() != null) vlog.setTitle(dto.getTitle());
        if (dto.getExcerpt() != null) vlog.setExcerpt(dto.getExcerpt());
        if (dto.getContent() != null) vlog.setContent(dto.getContent());
        if (dto.getVideoUrl() != null) vlog.setVideoUrl(dto.getVideoUrl());
        if (dto.getThumbnailUrl() != null) vlog.setThumbnailUrl(dto.getThumbnailUrl());
        if (dto.getCategory() != null) vlog.setCategory(dto.getCategory());
        if (dto.getIsFeatured() != null) vlog.setIsFeatured(dto.getIsFeatured());
        
        if (dto.getIsPublished() != null) {
            if (dto.getIsPublished() && !vlog.getIsPublished()) {
                vlog.setPublishedAt(LocalDateTime.now());
            } else if (!dto.getIsPublished() && vlog.getIsPublished()) {
                vlog.setPublishedAt(null);
            }
            vlog.setIsPublished(dto.getIsPublished());
        }

        return toDTO(vlogRepository.save(vlog));
    }

    @Transactional
    @CacheEvict(value = "publishedVlogs", allEntries = true)
    public void adminDeleteVlog(UUID vlogId) {
        Vlog vlog = vlogRepository.findById(vlogId)
                .orElseThrow(() -> new RuntimeException("Vlog not found"));
        vlogRepository.delete(vlog);
    }

    private Vlog getAndValidateOwnership(UUID vlogId, UUID doctorId) {
        Vlog vlog = vlogRepository.findById(vlogId)
                .orElseThrow(() -> new RuntimeException("Vlog not found"));
        
        if (!vlog.getDoctor().getId().equals(doctorId)) {
            throw new UnauthorizedException("You are not authorized to modify this vlog");
        }
        return vlog;
    }

    private VlogDTO toDTO(Vlog vlog) {
        Doctor doctor = vlog.getDoctor();
        String doctorName = null;
        String doctorSpecialization = null;
        String doctorCity = null;
        String doctorProfilePic = null;
        UUID authorDoctorId = null;

        if (doctor != null) {
            authorDoctorId = doctor.getId();
            doctorSpecialization = doctor.getSpecialization();
            doctorCity = doctor.getCity();
            doctorProfilePic = doctor.getProfilePictureUrl();
            if (doctor.getUser() != null) {
                doctorName = doctor.getUser().getFullName();
                if (doctorProfilePic == null) {
                    doctorProfilePic = doctor.getUser().getProfilePictureUrl();
                }
            }
        }

        return new VlogDTO(
                vlog.getId(), vlog.getTitle(), vlog.getExcerpt(), vlog.getContent(),
                vlog.getVideoUrl(), vlog.getThumbnailUrl(), vlog.getCategory(),
                vlog.getIsPublished(), vlog.getIsFeatured(), vlog.getViewsCount(), vlog.getPublishedAt(),
                vlog.getCreatedAt(), vlog.getUpdatedAt(),
                authorDoctorId, doctorName, doctorSpecialization, doctorProfilePic, doctorCity
        );
    }
}
