package com.example.skillshare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO class to represent a summary of user information
 * to be returned in API responses
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSummary {
    private Long id;
    private String username;
    private String email;

    // These fields match the constructor call in UserController.getCurrentUser()
    // method
    // UserSummary userSummary = new UserSummary(
    // currentUser.getId(),
    // currentUser.getUsername(),
    // currentUser.getEmail());
}
