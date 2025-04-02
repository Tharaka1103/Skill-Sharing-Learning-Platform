package com.example.skillshare.controller;

//package com.skillshare.controller;

import com.example.skillshare.dto.CommentRequest;
import com.example.skillshare.model.Comment;
import com.example.skillshare.security.UserDetailsImpl;
import com.example.skillshare.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Comment> addComment(@PathVariable Long postId,
            @Valid @RequestBody CommentRequest commentRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(commentService.addComment(postId, commentRequest, currentUser.getId()));
    }

    @PutMapping("/{commentId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Comment> updateComment(@PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest commentRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(commentService.updateComment(postId, commentId, commentRequest, currentUser.getId()));
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteComment(@PathVariable Long postId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        commentService.deleteComment(postId, commentId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
