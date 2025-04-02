package com.example.skillshare.service;

//package com.skillshare.service;

import com.example.skillshare.dto.MediaRequest;
import com.example.skillshare.dto.PostRequest;
import com.example.skillshare.exception.ResourceNotFoundException;
import com.example.skillshare.model.*;
import com.example.skillshare.repository.PostRepository;
import com.example.skillshare.repository.UserRepository;

import com.example.skillshare.model.LearningPlan;
import com.example.skillshare.model.Post;
import com.example.skillshare.model.PostType;
import com.example.skillshare.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LearningPlanService learningPlanService;

    public Page<Post> getAllPosts(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
    }

    public Page<Post> getPostsByUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return postRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    public Page<Post> getFeedPosts(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return postRepository.findFeedPosts(user, pageable);
    }

    @Transactional
    public Post createPost(PostRequest postRequest, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Post post = new Post();
        post.setContent(postRequest.getContent());
        post.setType(postRequest.getType());
        post.setUser(user);

        // Handle media attachments
        if (postRequest.getMedia() != null && !postRequest.getMedia().isEmpty()) {
            List<Media> mediaList = new ArrayList<>();
            // Limit to 3 media files per post
            int mediaCount = Math.min(postRequest.getMedia().size(), 3);
            for (int i = 0; i < mediaCount; i++) {
                MediaRequest mediaRequest = postRequest.getMedia().get(i);
                Media media = new Media();
                media.setUrl(mediaRequest.getUrl());
                media.setType(mediaRequest.getType());
                media.setPost(post);
                mediaList.add(media);
            }
            post.setMedia(mediaList);
        }

        // For learning plan type, create associated learning plan
        if (postRequest.getType() == PostType.LEARNING_PLAN && postRequest.getLearningPlan() != null) {
            LearningPlan learningPlan = learningPlanService.createLearningPlan(postRequest.getLearningPlan(), userId);
            learningPlan.setPost(post);
        }

        return postRepository.save(post);
    }

    @Transactional
    public Post updatePost(Long id, PostRequest postRequest, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));

        if (!post.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to update this post");
        }

        post.setContent(postRequest.getContent());
        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long id, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));

        if (!post.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this post");
        }

        postRepository.delete(post);
    }
}
