package com.example.skillshare.service;

//package com.skillshare.service;

import com.example.skillshare.dto.LearningPlanRequest;
import com.example.skillshare.dto.LearningStepRequest;
import com.example.skillshare.exception.ResourceNotFoundException;
import com.example.skillshare.model.LearningPlan;
import com.example.skillshare.model.LearningStep;
import com.example.skillshare.model.User;
import com.example.skillshare.repository.LearningPlanRepository;
import com.example.skillshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private UserRepository userRepository;

    public List<LearningPlan> getAllLearningPlans() {
        return learningPlanRepository.findAll();
    }

    public LearningPlan getLearningPlanById(Long id) {
        return learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", id));
    }

    public List<LearningPlan> getLearningPlansByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return learningPlanRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public LearningPlan createLearningPlan(LearningPlanRequest learningPlanRequest, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LearningPlan learningPlan = new LearningPlan();
        learningPlan.setTitle(learningPlanRequest.getTitle());
        learningPlan.setDescription(learningPlanRequest.getDescription());
        learningPlan.setCompletionTarget(learningPlanRequest.getCompletionTarget());
        learningPlan.setUser(user);

        // Add learning steps
        if (learningPlanRequest.getSteps() != null && !learningPlanRequest.getSteps().isEmpty()) {
            List<LearningStep> steps = new ArrayList<>();
            for (LearningStepRequest stepRequest : learningPlanRequest.getSteps()) {
                LearningStep step = new LearningStep();
                step.setTitle(stepRequest.getTitle());
                step.setDescription(stepRequest.getDescription());
                step.setResources(stepRequest.getResources());
                step.setCompleted(stepRequest.getCompleted() != null ? stepRequest.getCompleted() : false);
                step.setTargetDate(stepRequest.getTargetDate());
                step.setLearningPlan(learningPlan);
                steps.add(step);
            }
            learningPlan.setSteps(steps);
        }

        return learningPlanRepository.save(learningPlan);
    }

    @Transactional
    public LearningPlan updateLearningPlan(Long id, LearningPlanRequest learningPlanRequest, Long userId) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", id));

        if (!learningPlan.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to update this learning plan");
        }

        learningPlan.setTitle(learningPlanRequest.getTitle());
        learningPlan.setDescription(learningPlanRequest.getDescription());
        learningPlan.setCompletionTarget(learningPlanRequest.getCompletionTarget());
        learningPlan.setUpdatedAt(LocalDateTime.now());

        // Update learning steps (remove all and add new ones)
        learningPlan.getSteps().clear();

        if (learningPlanRequest.getSteps() != null && !learningPlanRequest.getSteps().isEmpty()) {
            for (LearningStepRequest stepRequest : learningPlanRequest.getSteps()) {
                LearningStep step = new LearningStep();
                step.setTitle(stepRequest.getTitle());
                step.setDescription(stepRequest.getDescription());
                step.setResources(stepRequest.getResources());
                step.setCompleted(stepRequest.getCompleted() != null ? stepRequest.getCompleted() : false);
                step.setTargetDate(stepRequest.getTargetDate());
                step.setLearningPlan(learningPlan);
                learningPlan.getSteps().add(step);
            }
        }

        return learningPlanRepository.save(learningPlan);
    }

    @Transactional
    public void deleteLearningPlan(Long id, Long userId) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", id));

        if (!learningPlan.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this learning plan");
        }

        learningPlanRepository.delete(learningPlan);
    }
}
