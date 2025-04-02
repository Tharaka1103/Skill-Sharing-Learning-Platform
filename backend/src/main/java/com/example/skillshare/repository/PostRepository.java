package com.example.skillshare.repository;

import com.example.skillshare.model.Post;
import com.example.skillshare.model.PostType;
import com.example.skillshare.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<Post> findByType(PostType type, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.user IN (SELECT u FROM User u JOIN u.followers f WHERE f = :user) OR p.user = :user ORDER BY p.createdAt DESC")
    Page<Post> findFeedPosts(User user, Pageable pageable);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
