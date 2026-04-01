package com.altruist.service;

import com.altruist.dto.SyncUserRequestDTO;
import com.altruist.model.User;
import com.altruist.model.UserType;
import com.altruist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User findOrCreateUserByFirebaseUid(String firebaseUid, String email, String phone) {
        Optional<User> existingUserOpt = userRepository.findByFirebaseUid(firebaseUid);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            boolean updated = false;
            
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
                updated = true;
            }
            if (phone != null && !phone.equals(user.getPhone())) {
                user.setPhone(phone);
                updated = true;
            }

            if (updated) {
                return userRepository.save(user);
            }
            return user;
        }

        User newUser = new User();
        newUser.setFirebaseUid(firebaseUid);
        newUser.setEmail(email);
        newUser.setPhone(phone);
        // Default new users from Firebase to PATIENT type
        newUser.setUserType(UserType.PATIENT);

        return userRepository.save(newUser);
    }

    @Transactional
    public User updateUserProfile(User user, SyncUserRequestDTO request) {
        boolean updated = false;

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
            updated = true;
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
            updated = true;
        }
        if (request.getDateOfBirth() != null) {
            try {
                user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
                updated = true;
            } catch (Exception e) {
                // Ignore invalid date formats
            }
        }
        if (request.getUserType() != null) {
            try {
                user.setUserType(UserType.valueOf(request.getUserType().toUpperCase()));
                updated = true;
            } catch (Exception e) {
                // Ignore invalid user types
            }
        }

        if (updated) {
            return userRepository.save(user);
        }
        return user;
    }
}
