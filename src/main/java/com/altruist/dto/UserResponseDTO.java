package com.altruist.dto;

import com.altruist.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private UUID id;
    private String email;
    private String fullName;
    private String userType;
    private String phone;
    private String profilePictureUrl;

    public static UserResponseDTO fromUser(User user) {
        if (user == null) {
            return null;
        }
        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .userType(user.getUserType() != null ? user.getUserType().name() : null)
                .phone(user.getPhone())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }
}
