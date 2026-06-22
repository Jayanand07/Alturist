package com.altruist.controller;

import com.altruist.dto.TestimonialResponseDTO;
import com.altruist.model.PatientTestimonial;
import com.altruist.repository.PatientTestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class TestimonialController {

    private final PatientTestimonialRepository testimonialRepository;

    @GetMapping("/api/testimonials")
    public ResponseEntity<List<TestimonialResponseDTO>> getTestimonials(
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "10") int limit) {
        
        List<PatientTestimonial> testimonials = testimonialRepository.findTestimonials(
                featured, 
                PageRequest.of(0, limit)
        );
        
        List<TestimonialResponseDTO> dtos = testimonials.stream()
                .map(t -> TestimonialResponseDTO.builder()
                        .id(t.getId())
                        .user(t.getPatientName())
                        .location(t.getCity())
                        .text(t.getReviewText())
                        .rating(t.getRating())
                        .tag(t.getTag())
                        .build())
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }
}
