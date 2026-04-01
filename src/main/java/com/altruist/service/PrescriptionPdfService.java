package com.altruist.service;

import com.altruist.dto.PrescriptionRequestDTO;
import com.altruist.exception.PDFGenerationException;
import com.altruist.model.Prescription;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.List;
import com.itextpdf.layout.element.ListItem;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class PrescriptionPdfService {

    private final ObjectMapper objectMapper;
    private final DeviceRgb tealColor = new DeviceRgb(13, 148, 136);

    public byte[] generatePrescriptionPDF(Prescription prescription) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // 1. Header
            document.add(new Paragraph("ALTRUIST MEDICAL PRESCRIPTION")
                    .setFontColor(tealColor)
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Prescription ID: " + prescription.getId())
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.RIGHT));
            document.add(new Paragraph("Date: " + prescription.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm")))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.RIGHT));
            document.add(new Paragraph("Valid Until: " + prescription.getValidUntil().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")))
                    .setFontSize(10)
                    .setBold()
                    .setTextAlignment(TextAlignment.RIGHT));

            document.add(new Paragraph("\n"));

            // 2. Doctor details box
            Table doctorTable = new Table(UnitValue.createPercentArray(new float[]{100}))
                    .useAllAvailableWidth()
                    .setBorder(null);
            
            doctorTable.addCell(new Cell().add(new Paragraph("DOCTOR DETAILS")
                    .setBold().setFontColor(tealColor)).setBorder(null));
            doctorTable.addCell(new Cell().add(new Paragraph("Dr. " + prescription.getDoctor().getUser().getFullName()))
                    .setBorder(null));
            doctorTable.addCell(new Cell().add(new Paragraph(prescription.getDoctor().getSpecialization() + " | License: " + prescription.getDoctor().getMedicalLicense()))
                    .setFontSize(10).setBorder(null));
            document.add(doctorTable);

            document.add(new Paragraph("\n"));

            // 3. Patient details box
            Table patientTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();
            
            patientTable.addCell(new Cell().add(new Paragraph("PATIENT DETAILS").setBold()));
            patientTable.addCell(new Cell().add(new Paragraph("CONSULTATION DATE").setBold()));
            
            patientTable.addCell(new Cell().add(new Paragraph("Name: " + prescription.getPatient().getFullName())));
            patientTable.addCell(new Cell().add(new Paragraph(prescription.getConsultation().getScheduledAt().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm")))));
            
            document.add(patientTable);

            document.add(new Paragraph("\n"));

            // 4. Diagnosis section
            document.add(new Paragraph("DIAGNOSIS").setBold().setFontColor(tealColor));
            document.add(new Paragraph(prescription.getNotes() != null ? prescription.getNotes() : "N/A"));

            document.add(new Paragraph("\n"));

            // 5. Medicines table
            document.add(new Paragraph("PRESCRIBED MEDICINES").setBold().setFontColor(tealColor));
            Table medTable = new Table(UnitValue.createPercentArray(new float[]{25, 15, 15, 15, 30}))
                    .useAllAvailableWidth();
            
            medTable.addHeaderCell(new Cell().add(new Paragraph("Medicine").setBold()));
            medTable.addHeaderCell(new Cell().add(new Paragraph("Dosage").setBold()));
            medTable.addHeaderCell(new Cell().add(new Paragraph("Frequency").setBold()));
            medTable.addHeaderCell(new Cell().add(new Paragraph("Duration").setBold()));
            medTable.addHeaderCell(new Cell().add(new Paragraph("Instructions").setBold()));

            java.util.List<PrescriptionRequestDTO.MedicineDTO> medicines = Collections.emptyList();
            try {
                medicines = objectMapper.readValue(prescription.getMedicines(), 
                        new TypeReference<java.util.List<PrescriptionRequestDTO.MedicineDTO>>() {});
            } catch (Exception ignored) {}

            for (PrescriptionRequestDTO.MedicineDTO med : medicines) {
                medTable.addCell(new Cell().add(new Paragraph(med.getName())));
                medTable.addCell(new Cell().add(new Paragraph(med.getDosage())));
                medTable.addCell(new Cell().add(new Paragraph(med.getFrequency())));
                medTable.addCell(new Cell().add(new Paragraph(med.getDuration())));
                medTable.addCell(new Cell().add(new Paragraph(med.getInstructions() != null ? med.getInstructions() : "")));
            }
            document.add(medTable);

            document.add(new Paragraph("\n"));

            // 6. Diagnostic Tests
            java.util.List<String> tests = Collections.emptyList();
            try {
                tests = objectMapper.readValue(prescription.getDiagnosticTests(), 
                        new TypeReference<java.util.List<String>>() {});
            } catch (Exception ignored) {}

            if (!tests.isEmpty()) {
                document.add(new Paragraph("RECOMMENDED TESTS:").setBold().setFontColor(tealColor));
                List list = new List().setSymbolIndent(12).setListSymbol("• ");
                for (String test : tests) {
                    list.add(new ListItem(test));
                }
                document.add(list);
            }

            if (prescription.getFollowUpDate() != null) {
                document.add(new Paragraph("\nNEXT FOLLOW-UP RECOMMENDED: " + 
                        prescription.getFollowUpDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")))
                        .setBold().setFontColor(ColorConstants.ORANGE));
            }

            // 7. Footer
            document.add(new Paragraph("\n\n"));
            LineSeparator ls = new LineSeparator(new SolidLine());
            document.add(ls);
            
            document.add(new Paragraph("This is a digitally generated prescription. No signature required.")
                    .setFontSize(8).setTextAlignment(TextAlignment.CENTER).setFontColor(ColorConstants.GRAY));
            document.add(new Paragraph("Altruist Healthcare | support@altruist.com")
                    .setFontSize(8).setTextAlignment(TextAlignment.CENTER).setFontColor(ColorConstants.GRAY));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new PDFGenerationException("Failed to generate prescription PDF", e);
        }
    }
}
