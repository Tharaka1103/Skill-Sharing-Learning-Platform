package com.example.skillshare.repository;

//package com.skillshare.repository;

import com.example.skillshare.model.LearningPlan;
import com.example.skillshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    List<LearningPlan> findByUserOrderByCreatedAtDesc(User user);
}
