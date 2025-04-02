package com.example.skillshare.service;

//package com.skillshare.service;

import com.example.skillshare.exception.ResourceNotFoundException;
import com.example.skillshare.model.User;
import com.example.skillshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
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
