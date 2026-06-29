package com.altruist.service;

import com.altruist.dto.LabBookingRequestDTO;
import com.altruist.dto.LabBookingResponseDTO;
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

        if (status != null && !status.trim().isEmpty()) {
            booking.setStatus(status.toUpperCase());
        }
        if (notes != null) {
            booking.setNotes(notes);
        }

        LabBooking saved = labBookingRepository.save(booking);
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
