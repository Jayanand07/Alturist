package com.altruist.service;

import com.altruist.dto.LabBookingRequestDTO;
import com.altruist.dto.LabBookingResponseDTO;
import com.altruist.dto.NotificationDTO;
import com.altruist.model.*;
import com.altruist.repository.LabBookingRepository;
import com.altruist.repository.LabPackageRepository;
import com.altruist.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LabBookingService {

    private final LabBookingRepository labBookingRepository;
    private final LabTestRepository labTestRepository;
    private final LabPackageRepository labPackageRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Transactional
    public LabBookingResponseDTO createBooking(User patient, LabBookingRequestDTO dto) {
        boolean hasTest = dto.getLabTestId() != null;
        boolean hasPackage = dto.getLabPackageId() != null;
        
        // Exclusivity validation (Flag 3)
        if (hasTest == hasPackage) {
            throw new IllegalArgumentException("Exactly one of Lab Test or Lab Package must be specified");
        }

        BigDecimal amount = BigDecimal.ZERO;
        String itemName = "";
        String bookingType = "";
        LabTest labTest = null;
        LabPackage labPackage = null;

        // Server-side price resolution (Flag 1)
        if (hasTest) {
            labTest = labTestRepository.findById(dto.getLabTestId())
                    .orElseThrow(() -> new RuntimeException("Lab Test not found"));
            amount = labTest.getDiscountedPrice() != null && labTest.getDiscountedPrice().compareTo(BigDecimal.ZERO) > 0
                    ? labTest.getDiscountedPrice() : labTest.getPrice();
            itemName = labTest.getName();
            bookingType = "TEST";
        } else {
            labPackage = labPackageRepository.findById(dto.getLabPackageId())
                    .orElseThrow(() -> new RuntimeException("Lab Package not found"));
            amount = labPackage.getDiscountedPrice() != null && labPackage.getDiscountedPrice().compareTo(BigDecimal.ZERO) > 0
                    ? labPackage.getDiscountedPrice() : labPackage.getOriginalPrice();
            itemName = labPackage.getName();
            bookingType = "PACKAGE";
        }

        LabBooking booking = LabBooking.builder()
                .patient(patient)
                .labTest(labTest)
                .labPackage(labPackage)
                .bookingType(bookingType)
                .preferredDate(dto.getPreferredDate())
                .preferredTimeSlot(dto.getPreferredTimeSlot())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .amount(amount)
                .status("PENDING")
                .paymentStatus("UNPAID")
                .build();

        LabBooking saved = labBookingRepository.save(booking);

        // Notify patient that the lab booking has been created
        try {
            NotificationDTO notification = notificationService.createNotification(
                    patient.getId(),
                    "Lab Booking Confirmed",
                    String.format("Your %s booking for %s on %s is confirmed.",
                            bookingType, itemName,
                            saved.getPreferredDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"))),
                    "LAB_BOOKED"
            );
            notificationService.publish(patient.getId(), notification);
        } catch (Exception e) {
            log.error("Failed to publish LAB_BOOKED notification for booking {}", saved.getId(), e);
        }

        // Send confirmation email asynchronously
        try {
            String formattedDate = saved.getPreferredDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
            emailService.sendLabBookingConfirmationEmail(
                    patient.getEmail(),
                    patient.getFullName(),
                    bookingType,
                    itemName,
                    formattedDate,
                    saved.getPreferredTimeSlot()
            );
        } catch (Exception e) {
            log.error("Failed to send lab booking confirmation email: {}", e.getMessage());
        }

        return mapToResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<LabBookingResponseDTO> getPatientBookings(UUID patientId) {
        return labBookingRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<LabBookingResponseDTO> getPatientBookings(UUID patientId, Pageable pageable) {
        return labBookingRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable)
                .map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<LabBookingResponseDTO> getAdminBookings(String status, String search, Pageable pageable) {
        String normalizedStatus = status == null || status.trim().isEmpty() ? null : status.trim();
        String normalizedSearch = search == null || search.trim().isEmpty() ? "" : search.trim();
        Page<LabBooking> bookings = labBookingRepository.findAdminBookings(normalizedStatus, normalizedSearch, pageable);
        return bookings.map(this::mapToResponseDTO);
    }

    @Transactional
    public LabBookingResponseDTO updateBookingStatus(UUID bookingId, String status, String notes) {
        LabBooking booking = labBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Lab Booking not found"));

        String previousStatus = booking.getStatus();

        if (status != null && !status.trim().isEmpty()) {
            booking.setStatus(status.toUpperCase());
        }
        if (notes != null) {
            booking.setNotes(notes);
        }

        LabBooking saved = labBookingRepository.save(booking);

        // Fire SSE notification on meaningful lab status transitions
        String newStatus = saved.getStatus();
        if (status != null && !status.trim().isEmpty() && !newStatus.equalsIgnoreCase(previousStatus)) {
            String type = null;
            String title = null;
            String message = null;
            if ("SAMPLE_COLLECTED".equalsIgnoreCase(newStatus)) {
                type = "LAB_SAMPLE_COLLECTED";
                title = "Sample Collected";
                message = String.format("Your sample for booking #%s has been collected and is being processed.", saved.getId());
            } else if ("COMPLETED".equalsIgnoreCase(newStatus) || "RESULTS_READY".equalsIgnoreCase(newStatus)) {
                type = "LAB_RESULTS_READY";
                title = "Lab Results Ready";
                message = String.format("Your lab results for booking #%s are now ready. Tap to view the report.", saved.getId());
            }
            if (type != null && saved.getPatient() != null) {
                try {
                    NotificationDTO notification = notificationService.createNotification(
                            saved.getPatient().getId(),
                            title,
                            message,
                            type
                    );
                    notificationService.publish(saved.getPatient().getId(), notification);
                } catch (Exception e) {
                    log.error("Failed to publish {} notification for booking {}", type, saved.getId(), e);
                }
            }
        }

        return mapToResponseDTO(saved);
    }

    private LabBookingResponseDTO mapToResponseDTO(LabBooking booking) {
        return LabBookingResponseDTO.builder()
                .id(booking.getId())
                .patientId(booking.getPatient().getId())
                .patientName(booking.getPatient().getFullName())
                .patientPhone(booking.getPatient().getPhone())
                .labTestId(booking.getLabTest() != null ? booking.getLabTest().getId() : null)
                .labTestName(booking.getLabTest() != null ? booking.getLabTest().getName() : null)
                .labPackageId(booking.getLabPackage() != null ? booking.getLabPackage().getId() : null)
                .labPackageName(booking.getLabPackage() != null ? booking.getLabPackage().getName() : null)
                .bookingType(booking.getBookingType())
                .preferredDate(booking.getPreferredDate())
                .preferredTimeSlot(booking.getPreferredTimeSlot())
                .address(booking.getAddress())
                .phone(booking.getPhone())
                .status(booking.getStatus())
                .amount(booking.getAmount())
                .paymentStatus(booking.getPaymentStatus())
                .notes(booking.getNotes())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
