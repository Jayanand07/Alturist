package com.altruist.controller;

import com.altruist.dto.VlogRequestDTO;
import com.altruist.dto.VlogDTO;
import com.altruist.exception.UnauthorizedException;
import com.altruist.model.Doctor;
import com.altruist.model.User;
import com.altruist.repository.DoctorRepository;
import com.altruist.service.VlogService;
import com.altruist.service.SupabaseStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DoctorVlogController {

    private final VlogService vlogService;
    private final DoctorRepository doctorRepository;
    private final SupabaseStorageService storageService;

    private UUID getDoctorIdForUser(User user) {
        return doctorRepository.findByUserId(user.getId())
                .map(Doctor::getId)
                .orElseThrow(() -> new UnauthorizedException("User is not a registered doctor"));
    }

    // --- Public Endpoints ---

    @GetMapping("/vlogs")
    public ResponseEntity<?> getPublishedVlogs(@RequestParam(required = false) String category) {
        try {
            return ResponseEntity.ok(vlogService.getPublishedVlogs(category));
        } catch (Exception e) {
            log.error("Failed to fetch published vlogs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to fetch vlogs."));
        }
    }

    @GetMapping("/vlogs/{vlogId}")
    public ResponseEntity<?> getVlog(@PathVariable UUID vlogId) {
        try {
            return ResponseEntity.ok(vlogService.getPublishedVlogByIdAndIncrementViews(vlogId));
        } catch (Exception e) {
            log.warn("Failed to fetch vlog {}: {}", vlogId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Vlog not found or not published."));
        }
    }

    // --- Doctor Endpoints ---

    @GetMapping("/doctors/my/vlogs")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getMyVlogs(@AuthenticationPrincipal User user) {
        try {
            UUID doctorId = getDoctorIdForUser(user);
            return ResponseEntity.ok(vlogService.getDoctorVlogs(doctorId));
        } catch (Exception e) {
            log.warn("Failed to fetch vlogs for doctor user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to fetch your vlogs."));
        }
    }

    @PostMapping("/doctors/my/vlogs")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createVlog(@AuthenticationPrincipal User user, @Valid @RequestBody VlogRequestDTO dto) {
        try {
            UUID doctorId = getDoctorIdForUser(user);
            return ResponseEntity.ok(vlogService.createVlogForDoctor(doctorId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.warn("Failed to create vlog for doctor user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to create vlog."));
        }
    }

    @PutMapping("/doctors/my/vlogs/{vlogId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateVlog(@AuthenticationPrincipal User user, @PathVariable UUID vlogId, @Valid @RequestBody VlogRequestDTO dto) {
        try {
            UUID doctorId = getDoctorIdForUser(user);
            return ResponseEntity.ok(vlogService.updateVlogForDoctor(vlogId, doctorId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.warn("Failed to update vlog {} for doctor user {}: {}", vlogId, user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to update vlog."));
        }
    }

    @PostMapping("/doctors/my/vlogs/{vlogId}/publish")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> publishVlog(@AuthenticationPrincipal User user, @PathVariable UUID vlogId) {
        try {
            UUID doctorId = getDoctorIdForUser(user);
            vlogService.publishVlog(vlogId, doctorId);
            return ResponseEntity.ok(Map.of("message", "Vlog published successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.warn("Failed to publish vlog {} for doctor user {}: {}", vlogId, user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to publish vlog."));
        }
    }

    @PostMapping("/doctors/my/vlogs/{vlogId}/unpublish")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> unpublishVlog(@AuthenticationPrincipal User user, @PathVariable UUID vlogId) {
        try {
            UUID doctorId = getDoctorIdForUser(user);
            vlogService.unpublishVlog(vlogId, doctorId);
            return ResponseEntity.ok(Map.of("message", "Vlog unpublished successfully"));
        } catch (Exception e) {
            log.warn("Failed to unpublish vlog {} for doctor user {}: {}", vlogId, user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to unpublish vlog."));
        }
    }

    @DeleteMapping("/doctors/my/vlogs/{vlogId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> deleteVlog(@AuthenticationPrincipal User user, @PathVariable UUID vlogId) {
        try {
            UUID doctorId = getDoctorIdForUser(user);
            vlogService.deleteVlog(vlogId, doctorId);
            return ResponseEntity.ok(Map.of("message", "Vlog deleted successfully"));
        } catch (Exception e) {
            log.warn("Failed to delete vlog {} for doctor user {}: {}", vlogId, user.getId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Unable to delete vlog."));
        }
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/vlogs")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> adminGetAllVlogs() {
        try {
            return ResponseEntity.ok(vlogService.adminGetAllVlogs());
        } catch (Exception e) {
            log.error("Admin failed to fetch all vlogs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to fetch vlogs."));
        }
    }

    @PostMapping("/admin/vlogs")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> adminCreateVlog(@Valid @RequestBody VlogRequestDTO dto) {
        try {
            return ResponseEntity.ok(vlogService.adminCreateVlog(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Admin failed to create vlog", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to create vlog."));
        }
    }

    @PutMapping("/admin/vlogs/{vlogId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> adminUpdateVlog(@PathVariable UUID vlogId, @Valid @RequestBody VlogRequestDTO dto) {
        try {
            return ResponseEntity.ok(vlogService.adminUpdateVlog(vlogId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Admin failed to update vlog {}", vlogId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to update vlog."));
        }
    }

    @DeleteMapping("/admin/vlogs/{vlogId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> adminDeleteVlog(@PathVariable UUID vlogId) {
        try {
            vlogService.adminDeleteVlog(vlogId);
            return ResponseEntity.ok(Map.of("message", "Vlog deleted successfully"));
        } catch (Exception e) {
            log.error("Admin failed to delete vlog {}", vlogId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to delete vlog."));
        }
    }

    @PostMapping("/admin/vlogs/upload-thumbnail")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> adminUploadThumbnail(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "File is empty"));
            }
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            String publicUrl = storageService.uploadFile("vlog-thumbnails", fileName, file.getBytes(), file.getContentType());
            return ResponseEntity.ok(Map.of("url", publicUrl));
        } catch (Exception e) {
            log.error("Failed to upload thumbnail", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload thumbnail"));
        }
    }
}
