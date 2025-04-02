package com.example.skillshare.controller;

//package com.skillshare.controller;

import com.example.skillshare.dto.PostRequest;
import com.example.skillshare.model.Post;
import com.example.skillshare.security.UserDetailsImpl;
import com.example.skillshare.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public ResponseEntity<Page<Post>> getAllPosts(Pageable pageable) {
        return ResponseEntity.ok(postService.getAllPosts(pageable));
    }

    @GetMapping("/feed")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<Post>> getFeedPosts(@AuthenticationPrincipal UserDetailsImpl currentUser,
            Pageable pageable) {
        return ResponseEntity.ok(postService.getFeedPosts(currentUser.getId(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Post>> getPostsByUser(@PathVariable Long userId, Pageable pageable) {
        return ResponseEntity.ok(postService.getPostsByUser(userId, pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Post> createPost(@Valid @RequestBody PostRequest postRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(postService.createPost(postRequest, currentUser.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Post> updatePost(@PathVariable Long id,
            @Valid @RequestBody PostRequest postRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(postService.updatePost(id, postRequest, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deletePost(@PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        postService.deletePost(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
