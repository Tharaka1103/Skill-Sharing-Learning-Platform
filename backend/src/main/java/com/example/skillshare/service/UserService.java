package com.example.skillshare.service;

import com.example.skillshare.dto.UserProfileUpdateRequest;
import com.example.skillshare.exception.ResourceNotFoundException;
import com.example.skillshare.model.User;
import com.example.skillshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    @Transactional
    public User updateUserProfile(UserProfileUpdateRequest updateRequest, Long currentUserId) {
        User existingUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        // Update bio if provided
        if (updateRequest.getBio() != null) {
            existingUser.setBio(updateRequest.getBio());
        }

        // Update profile picture if provided
        if (updateRequest.getProfilePicture() != null) {
            existingUser.setProfilePicture(updateRequest.getProfilePicture());
        }

        // Update email if provided and different
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(existingUser.getEmail())) {
            // Check if email is already taken
            if (userRepository.existsByEmail(updateRequest.getEmail())) {
                throw new IllegalArgumentException("Email is already in use");
            }
            existingUser.setEmail(updateRequest.getEmail());
        }

        // Update username if provided and different
        if (updateRequest.getUsername() != null && !updateRequest.getUsername().equals(existingUser.getUsername())) {
            // Check if username is already taken
            if (userRepository.existsByUsername(updateRequest.getUsername())) {
                throw new IllegalArgumentException("Username is already taken");
            }
            existingUser.setUsername(updateRequest.getUsername());
        }

        // Update password if provided
        if (updateRequest.getNewPassword() != null && !updateRequest.getNewPassword().isEmpty()) {
            // Verify current password
            if (updateRequest.getCurrentPassword() == null ||
                    !passwordEncoder.matches(updateRequest.getCurrentPassword(), existingUser.getPassword())) {
                throw new AccessDeniedException("Current password is incorrect");
            }

            // Set new password
            existingUser.setPassword(passwordEncoder.encode(updateRequest.getNewPassword()));
        }

        // Save and return the updated user
        return userRepository.save(existingUser);
    }

    @Transactional
    public void followUser(Long currentUserId, Long userToFollowId) {
        if (currentUserId.equals(userToFollowId)) {
            throw new AccessDeniedException("You cannot follow yourself");
        }

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));
        User userToFollow = userRepository.findById(userToFollowId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userToFollowId));

        currentUser.getFollowing().add(userToFollow);
        userToFollow.getFollowers().add(currentUser);

        userRepository.save(currentUser);
        userRepository.save(userToFollow);
    }

    @Transactional
    public void unfollowUser(Long currentUserId, Long userToUnfollowId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));
        User userToUnfollow = userRepository.findById(userToUnfollowId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userToUnfollowId));

        currentUser.getFollowing().remove(userToUnfollow);
        userToUnfollow.getFollowers().remove(currentUser);

        userRepository.save(currentUser);
        userRepository.save(userToUnfollow);
    }

}
