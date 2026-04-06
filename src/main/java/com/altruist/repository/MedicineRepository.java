package com.altruist.repository;

import com.altruist.model.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, UUID> {

    @Query("SELECT m FROM Medicine m WHERE " +
           "(:search = '' OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category = '' OR m.category = :category) AND " +
           "(:prescription IS NULL OR m.requiresPrescription = :prescription) AND " +
           "(:inStock IS NULL OR m.inStock = :inStock)")
    Page<Medicine> searchMedicines(
            @Param("search") String search,
            @Param("category") String category,
            @Param("prescription") Boolean prescription,
            @Param("inStock") Boolean inStock,
            Pageable pageable);

    long countByInStockTrue();

    long countByRequiresPrescriptionTrue();
}
