package com.altruist.controller;

import com.altruist.dto.LabPackageDTO;
import com.altruist.dto.LabTestDTO;
import com.altruist.service.LabService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LabController {

    private final LabService labService;

    @GetMapping("/lab-tests/featured")
    public ResponseEntity<List<LabTestDTO>> getFeaturedTests() {
        return ResponseEntity.ok(labService.getFeaturedTests());
    }

    @GetMapping("/lab-packages")
    public ResponseEntity<List<LabPackageDTO>> getActivePackages() {
        return ResponseEntity.ok(labService.getActivePackages());
    }
}
