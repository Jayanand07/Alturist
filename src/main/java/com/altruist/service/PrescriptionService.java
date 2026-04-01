package com.altruist.service;

import com.altruist.dto.PrescriptionRequestDTO;
import com.altruist.dto.PrescriptionResponseDTO;
import com.altruist.exception.ConsultationNotFoundException;
import com.altruist.model.Consultation;
import com.altruist.model.ConsultationStatus;
import com.altruist.model.Doctor;
import com.altruist.model.Prescription;
import com.altruist.repository.ConsultationRepository;
import com.altruist.repository.DoctorRepository;
import com.altruist.repository.PrescriptionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final ConsultationRepository consultationRepository;
    private final DoctorRepository doctorRepository;
    private final PrescriptionPdfService prescriptionPdfService;
    private final SupabaseStorageService supabaseStorageService;
    private final ObjectMapper objectMapper;

    /**
     * Creates a new prescription and marks the associated consultation as COMPLETED.
     */
    @Transactional
    public PrescriptionResponseDTO createPrescription(PrescriptionRequestDTO request) {
        Consultation consultation = consultationRepository.findById(request.getConsultationId())
                .orElseThrow(() -> new ConsultationNotFoundException(request.getConsultationId()));

        Prescription prescription = new Prescription();
        prescription.setConsultation(consultation);
        prescription.setPatient(consultation.getPatient());
        prescription.setDoctor(consultation.getDoctor());
        
        // Use ObjectMapper to store structured data as JSON string in the TEXT columns
        try {
            prescription.setMedicines(objectMapper.writeValueAsString(request.getMedicines()));
            prescription.setDiagnosticTests(objectMapper.writeValueAsString(request.getDiagnosticTests()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize prescription data", e);
        }

        prescription.setNotes(request.getDiagnosis());
        prescription.setValidUntil(request.getValidUntil());
        prescription.setFollowUpDate(request.getFollowUpDate());
        
        Prescription saved = prescriptionRepository.save(prescription);

        // Update consultation status and metadata
        consultation.setStatus(ConsultationStatus.COMPLETED);
        consultation.setDiagnosis(request.getDiagnosis());
        consultationRepository.save(consultation);

        // Increment doctor's total consultations
        Doctor doctor = consultation.getDoctor();
        doctor.setTotalConsultations(doctor.getTotalConsultations() + 1);
        doctorRepository.save(doctor);

        // Generate PDF
        byte[] pdfBytes = prescriptionPdfService.generatePrescriptionPDF(saved);

        // Upload to Supabase
        String filePath = String.format("prescriptions/%s/%s.pdf", 
                consultation.getId(), saved.getId());
        
        String publicUrl = supabaseStorageService.uploadFile(
                "prescriptions",
                filePath,
                pdfBytes,
                "application/pdf"
        );

        // Save URL to prescription and consultation
        saved.setPrescriptionUrl(publicUrl);
        prescriptionRepository.save(saved);
        
        consultation.setPrescriptionUrl(publicUrl);
        consultationRepository.save(consultation);

        return mapToResponseDTO(saved);
    }

    private PrescriptionResponseDTO mapToResponseDTO(Prescription prescription) {
        try {
            return PrescriptionResponseDTO.builder()
                    .id(prescription.getId())
                    .consultationId(prescription.getConsultation().getId())
                    .patientName(prescription.getPatient().getFullName())
                    .doctorName(prescription.getDoctor().getUser().getFullName())
                    .diagnosis(prescription.getNotes())
                    .medicines(objectMapper.readValue(prescription.getMedicines(), 
                               new TypeReference<List<PrescriptionRequestDTO.MedicineDTO>>() {}))
                    .diagnosticTests(objectMapper.readValue(prescription.getDiagnosticTests(), 
                               new TypeReference<List<String>>() {}))
                    .validUntil(prescription.getValidUntil())
                    .followUpDate(prescription.getFollowUpDate())
                    .createdAt(prescription.getCreatedAt())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to map prescription response", e);
        }
    }
}
