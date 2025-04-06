package com.example.skillshare.controller;

import com.example.skillshare.dto.UserProfileDto;
import com.example.skillshare.model.User;
import com.example.skillshare.repository.UserRepository;
import com.example.skillshare.service.FileStorageService;
import com.example.skillshare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails currentUser) {
        String email = currentUser.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody UserProfileDto userProfileDto) {

        String email = currentUser.getUsername();
        User updatedUser = userService.updateUserProfile(email, userProfileDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<?> updateProfilePicture(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam("profilePicture") MultipartFile file) {

        String email = currentUser.getUsername();
        String imageUrl = fileStorageService.storeFile(file);
        User updatedUser = userService.updateProfilePicture(email, imageUrl);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/profile/cover")
    public ResponseEntity<?> updateCoverPicture(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam("coverPhoto") MultipartFile file) {

        String email = currentUser.getUsername();
        String imageUrl = fileStorageService.storeFile(file);
        User updatedUser = userService.updateCoverPicture(email, imageUrl);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<?> followUser(
            @AuthenticationPrincipal UserDetails currentUser,
            @PathVariable String userId) {

        String email = currentUser.getUsername();
        userService.followUser(email, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<?> unfollowUser(
            @AuthenticationPrincipal UserDetails currentUser,
            @PathVariable String userId) {

        String email = currentUser.getUsername();
        userService.unfollowUser(email, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getUserFollowers(@PathVariable String userId) {
        List<User> followers = userService.getUserFollowers(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("data", followers);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getUserFollowing(@PathVariable String userId) {
        List<User> following = userService.getUserFollowing(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("data", following);
        return ResponseEntity.ok(response);
    }

    // Skill management endpoints
    @PostMapping("/me/skills")
    public ResponseEntity<?> addSkill(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody Map<String, String> payload) {

        String email = currentUser.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String skillName = payload.get("name");
        if (!user.getSkills().contains(skillName)) {
            user.getSkills().add(skillName);
            userRepository.save(user);
        }

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/me/skills/{skillName}")
    public ResponseEntity<?> removeSkill(
            @AuthenticationPrincipal UserDetails currentUser,
            @PathVariable String skillName) {

        String email = currentUser.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getSkills().remove(skillName);
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }
}
