package com.example.skillshare.repository;

//package com.skillshare.repository;

import com.example.skillshare.model.Like;
import com.example.skillshare.model.Post;
import com.example.skillshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByPostAndUser(Post post, User user);

    Long countByPost(Post post);

    boolean existsByPostAndUser(Post post, User user);
}
