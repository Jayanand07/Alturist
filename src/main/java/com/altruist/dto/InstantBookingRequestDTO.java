package com.altruist.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class InstantBookingRequestDTO {
    private UUID doctorId;
    private String consultationType; // "INSTANT"
    private String chiefComplaint;
}
