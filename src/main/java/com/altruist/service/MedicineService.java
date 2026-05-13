package com.altruist.service;

import com.altruist.dto.MedicineBulkResultDTO;
import com.altruist.dto.MedicineDTO;
import com.altruist.dto.MedicineResponseDTO;
import com.altruist.model.Medicine;
import com.altruist.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;

    @Transactional(readOnly = true)
    public Page<MedicineResponseDTO> getMedicines(String search, String category, Boolean prescription, Boolean inStock, Pageable pageable) {
        // SECURITY: MedicineRepository.searchMedicines MUST use @Query with :search parameter binding
        // NEVER use string concatenation — SQL injection risk
        return medicineRepository.searchMedicines(
                search == null || search.trim().isEmpty() ? "" : search.trim(),
                category == null || category.trim().isEmpty() ? "" : category,
                prescription,
                inStock,
                pageable
        ).map(this::mapToResponseDTO);
    }

    @Transactional
    public MedicineResponseDTO createMedicine(MedicineDTO dto) {
        Medicine medicine = mapToEntity(dto);
        Medicine saved = medicineRepository.save(medicine);
        return mapToResponseDTO(saved);
    }

    @Transactional
    public MedicineResponseDTO updateMedicine(UUID id, MedicineDTO dto) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        
        medicine.setName(dto.getName());
        medicine.setGenericName(dto.getGenericName());
        medicine.setManufacturer(dto.getManufacturer());
        medicine.setCategory(dto.getCategory());
        medicine.setPrice(dto.getPrice());
        medicine.setDiscountedPrice(dto.getDiscountedPrice());
        medicine.setRequiresPrescription(dto.getRequiresPrescription() != null ? dto.getRequiresPrescription() : false);
        medicine.setInStock(dto.getInStock() != null ? dto.getInStock() : true);
        medicine.setDescription(dto.getDescription());
        medicine.setImageUrl(dto.getImageUrl());

        // SECURITY: Ensure discounted price never exceeds regular price
        if (medicine.getDiscountedPrice() != null && medicine.getDiscountedPrice().compareTo(medicine.getPrice()) > 0) {
            medicine.setDiscountedPrice(medicine.getPrice());
        }
        
        Medicine saved = medicineRepository.save(medicine);
        return mapToResponseDTO(saved);
    }

    @Transactional
    public void deleteMedicine(UUID id) {
        if (!medicineRepository.existsById(id)) {
            throw new RuntimeException("Medicine not found");
        }
        medicineRepository.deleteById(id);
    }

    @Transactional
    public void toggleStock(UUID id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        medicine.setInStock(!medicine.getInStock());
        medicineRepository.save(medicine);
    }

    @Transactional
    public MedicineBulkResultDTO bulkCreate(List<MedicineDTO> dtoList) {
        int created = 0;
        int failed = 0;
        List<String> errors = new java.util.ArrayList<>();

        for (int i = 0; i < dtoList.size(); i++) {
            MedicineDTO dto = dtoList.get(i);
            try {
                if (dto.getName() == null || dto.getName().trim().isEmpty() ||
                    dto.getManufacturer() == null || dto.getManufacturer().trim().isEmpty() ||
                    dto.getPrice() == null) {
                    failed++;
                    errors.add("Row " + (i + 1) + ": Missing required fields (Name, Manufacturer, Price)");
                    continue;
                }
                
                Medicine medicine = mapToEntity(dto);
                medicineRepository.save(medicine);
                created++;
            } catch (Exception e) {
                failed++;
                errors.add("Row " + (i + 1) + " [" + (dto.getName() != null ? dto.getName() : "unknown") + "]: " + e.getMessage());
            }
        }

        return MedicineBulkResultDTO.builder()
                .created(created)
                .failed(failed)
                .errors(errors)
                .build();
    }

    @Transactional(readOnly = true)
    public long getTotalMedicines() {
        return medicineRepository.count();
    }

    @Transactional(readOnly = true)
    public long getInStockCount() {
        return medicineRepository.countByInStockTrue();
    }

    @Transactional(readOnly = true)
    public long getRequiresPrescriptionCount() {
        return medicineRepository.countByRequiresPrescriptionTrue();
    }

    // --- Private Mappers ---
    
    private Medicine mapToEntity(MedicineDTO dto) {
        return Medicine.builder()
                .name(dto.getName())
                .genericName(dto.getGenericName())
                .manufacturer(dto.getManufacturer())
                .category(dto.getCategory())
                .price(dto.getPrice())
                .discountedPrice(dto.getDiscountedPrice())
                .requiresPrescription(dto.getRequiresPrescription() != null ? dto.getRequiresPrescription() : false)
                .inStock(dto.getInStock() != null ? dto.getInStock() : true)
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .build();
    }

    private MedicineResponseDTO mapToResponseDTO(Medicine md) {
        return MedicineResponseDTO.builder()
                .id(md.getId())
                .name(md.getName())
                .genericName(md.getGenericName())
                .manufacturer(md.getManufacturer())
                .category(md.getCategory())
                .price(md.getPrice())
                .discountedPrice(md.getDiscountedPrice())
                .requiresPrescription(md.getRequiresPrescription())
                .inStock(md.getInStock())
                .description(md.getDescription())
                .imageUrl(md.getImageUrl())
                .createdAt(md.getCreatedAt())
                .updatedAt(md.getUpdatedAt())
                .build();
    }
}
