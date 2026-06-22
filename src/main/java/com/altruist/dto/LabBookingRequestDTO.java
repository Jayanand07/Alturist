package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabBookingRequestDTO {
    private UUID labTestId;
    private UUID labPackageId;

    @NotNull(message = "Preferred date is required")
    private LocalDate preferredDate;

    @NotBlank(message = "Preferred time slot is required")
    private String preferredTimeSlot;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Phone is required")
    private String phone;
}
