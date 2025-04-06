package com.example.skillshare.service;

import com.example.skillshare.dto.LearningPlanDto;
import com.example.skillshare.model.LearningPlan;
import com.example.skillshare.model.LearningStep;
import com.example.skillshare.model.Notification;
import com.example.skillshare.model.User;
import com.example.skillshare.repository.LearningPlanRepository;
import com.example.skillshare.repository.NotificationRepository;
import com.example.skillshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    private final LearningPlanRepository learningPlanRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public LearningPlan getLearningPlanById(String planId) {
        return learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Learning plan not found"));
    }

    public Page<LearningPlan> getLearningPlansByEmail(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return learningPlanRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
    }

    public Page<LearningPlan> getLearningPlansByUserId(String userId, Pageable pageable) {
        return learningPlanRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public LearningPlan createLearningPlan(String email, LearningPlanDto learningPlanDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan learningPlan = new LearningPlan();
        learningPlan.setUserId(user.getId());
        learningPlan.setTitle(learningPlanDto.getTitle());
        learningPlan.setDescription(learningPlanDto.getDescription());
        learningPlan.setSkill(learningPlanDto.getSkill());
        learningPlan.setDeadline(learningPlanDto.getDeadline());

        // Add unique IDs to learning steps
        for (LearningStep step : learningPlanDto.getSteps()) {
            step.setId(UUID.randomUUID().toString());
        }

        learningPlan.setSteps(learningPlanDto.getSteps());
        learningPlan.setCreatedAt(new Date());
        learningPlan.setUpdatedAt(new Date());

        return learningPlanRepository.save(learningPlan);
    }

    public LearningPlan updateLearningPlan(String email, String planId, LearningPlanDto learningPlanDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Learning plan not found"));

        if (!learningPlan.getUserId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to update this learning plan");
        }

        learningPlan.setTitle(learningPlanDto.getTitle());
        learningPlan.setDescription(learningPlanDto.getDescription());
        learningPlan.setSkill(learningPlanDto.getSkill());
        learningPlan.setDeadline(learningPlanDto.getDeadline());

        // Add unique IDs to new learning steps
        for (LearningStep step : learningPlanDto.getSteps()) {
            if (step.getId() == null || step.getId().isEmpty()) {
                step.setId(UUID.randomUUID().toString());
            }
        }

        learningPlan.setSteps(learningPlanDto.getSteps());
        learningPlan.setUpdatedAt(new Date());

        return learningPlanRepository.save(learningPlan);
    }

    public void deleteLearningPlan(String email, String planId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Learning plan not found"));

        if (!learningPlan.getUserId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to delete this learning plan");
        }

        learningPlanRepository.delete(learningPlan);
    }

    public LearningPlan updateLearningPlanProgress(String email, String planId, int progress) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Learning plan not found"));

        if (!learningPlan.getUserId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to update this learning plan");
        }

        // Validate progress percentage
        if (progress < 0 || progress > 100) {
            throw new RuntimeException("Progress must be between 0 and 100");
        }

        int oldProgress = learningPlan.getProgress();
        learningPlan.setProgress(progress);
        learningPlan.setUpdatedAt(new Date());

        LearningPlan updatedPlan = learningPlanRepository.save(learningPlan);

        // Create learning update notification for followers if significant progress is
        // made
        if (progress > oldProgress && (progress == 100 || progress % 25 == 0)) {
            createLearningUpdateNotification(user, learningPlan);
        }

        return updatedPlan;
    }

    public LearningPlan updateLearningStepStatus(String email, String planId, String stepId, boolean completed) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Learning plan not found"));

        if (!learningPlan.getUserId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to update this learning plan");
        }

        boolean stepFound = false;
        for (LearningStep step : learningPlan.getSteps()) {
            if (step.getId().equals(stepId)) {
                step.setCompleted(completed);
                stepFound = true;
                break;
            }
        }

        if (!stepFound) {
            throw new RuntimeException("Learning step not found");
        }

        // Recalculate progress
        int completedSteps = 0;
        for (LearningStep step : learningPlan.getSteps()) {
            if (step.isCompleted()) {
                completedSteps++;
            }
        }

        int totalSteps = learningPlan.getSteps().size();
        int newProgress = totalSteps > 0 ? (completedSteps * 100) / totalSteps : 0;

        int oldProgress = learningPlan.getProgress();
        learningPlan.setProgress(newProgress);
        learningPlan.setUpdatedAt(new Date());

        LearningPlan updatedPlan = learningPlanRepository.save(learningPlan);

        // Create learning update notification for followers if significant progress is
        // made
        if (newProgress > oldProgress && (newProgress == 100 || newProgress % 25 == 0)) {
            createLearningUpdateNotification(user, learningPlan);
        }

        return updatedPlan;
    }

    private void createLearningUpdateNotification(User user, LearningPlan learningPlan) {
        for (String followerId : user.getFollowers()) {
            Notification notification = new Notification();
            notification.setUserId(followerId);
            notification.setSenderId(user.getId());
            notification.setType("LEARNING_UPDATE");

            String progressMessage = learningPlan.getProgress() == 100
                    ? "completed"
                    : "reached " + learningPlan.getProgress() + "% progress on";

            notification
                    .setContent(user.getName() + " " + progressMessage + " learning plan: " + learningPlan.getTitle());
            notification.setEntityId(learningPlan.getId());
            notification.setCreatedAt(new Date());

            notificationRepository.save(notification);
        }
    }
}
