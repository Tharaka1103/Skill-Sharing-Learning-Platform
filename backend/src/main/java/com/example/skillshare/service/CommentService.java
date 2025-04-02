package com.example.skillshare.service;

//package com.skillshare.service;

import com.example.skillshare.dto.CommentRequest;
import com.example.skillshare.exception.ResourceNotFoundException;
import com.example.skillshare.model.Comment;
import com.example.skillshare.model.Post;
import com.example.skillshare.model.User;
import com.example.skillshare.repository.CommentRepository;
import com.example.skillshare.repository.PostRepository;
import com.example.skillshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Comment> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        return commentRepository.findByPostOrderByCreatedAtDesc(post);
    }

    @Transactional
    public Comment addComment(Long postId, CommentRequest commentRequest, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Comment comment = new Comment();
        comment.setContent(commentRequest.getContent());
        comment.setPost(post);
        comment.setUser(user);

        return commentRepository.save(comment);
    }

    @Transactional
    public Comment updateComment(Long postId, Long commentId, CommentRequest commentRequest, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to update this comment");
        }

        if (!comment.getPost().getId().equals(postId)) {
            throw new AccessDeniedException("Comment does not belong to the specified post");
        }

        comment.setContent(commentRequest.getContent());
        comment.setUpdatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        // Allow both the comment owner and the post owner to delete the comment
        if (!comment.getUser().getId().equals(userId) && !post.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this comment");
        }

        if (!comment.getPost().getId().equals(postId)) {
            throw new AccessDeniedException("Comment does not belong to the specified post");
        }

        commentRepository.delete(comment);
    }
}
