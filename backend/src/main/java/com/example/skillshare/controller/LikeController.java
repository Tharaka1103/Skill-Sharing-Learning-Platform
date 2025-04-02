//package backend.src.main.java.com.example.skillshare.controller;

package com.example.skillshare.controller;

import com.example.skillshare.security.UserDetailsImpl;
import com.example.skillshare.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/posts/{postId}/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @GetMapping("/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.getLikeCount(postId));
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Boolean> hasUserLiked(@PathVariable Long postId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(likeService.hasUserLiked(postId, currentUser.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> toggleLike(@PathVariable Long postId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        likeService.toggleLike(postId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
