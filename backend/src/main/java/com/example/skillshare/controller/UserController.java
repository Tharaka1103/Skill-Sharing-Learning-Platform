package com.example.skillshare.controller;

import com.example.skillshare.dto.MessageResponse;
import com.example.skillshare.dto.UserProfileUpdateRequest;
import com.example.skillshare.dto.UserSummary;
import com.example.skillshare.model.User;
import com.example.skillshare.security.UserDetailsImpl;
import com.example.skillshare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserSummary> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        UserSummary userSummary = new UserSummary(
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getEmail());
        return ResponseEntity.ok(userSummary);
    }

    @GetMapping("/{username}")
    public ResponseEntity<User> getUserProfile(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // For security, don't send the password back to client
            user.setPassword(null);

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateUserProfile(
            @Valid @RequestBody UserProfileUpdateRequest updateRequest, // Use the DTO
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            // Ensure users can only update their own profile
            if (!currentUser.getId().equals(updateRequest.getId())) {
                return ResponseEntity
                        .status(403)
                        .body(new MessageResponse("You are not authorized to update this profile"));
            }

            User updatedUser = userService.updateUserProfile(updateRequest, currentUser.getId());

            // For security, don't send the password back to client
            updatedUser.setPassword(null);

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(new MessageResponse("Failed to update profile: " + e.getMessage()));
        }
    }

    @PostMapping("/{userId}/follow")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> followUser(@PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        userService.followUser(currentUser.getId(), userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/unfollow")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> unfollowUser(@PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        userService.unfollowUser(currentUser.getId(), userId);
        return ResponseEntity.ok().build();
    }
}
