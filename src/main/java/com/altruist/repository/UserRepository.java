package com.altruist.repository;

import com.altruist.model.User;
import com.altruist.model.UserType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByFirebaseUid(String firebaseUid);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    List<User> findByUserType(UserType userType);

    long countByUserType(UserType userType);

    List<User> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT u FROM User u WHERE u.userType = 'PATIENT' AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchPatients(@Param("search") String search, Pageable pageable);

    boolean existsByFirebaseUid(String firebaseUid);

    boolean existsByEmail(String email);
}
