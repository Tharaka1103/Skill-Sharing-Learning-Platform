package com.example.skillshare.controller;

//package com.skillshare.controller;

import com.example.skillshare.dto.LearningPlanRequest;
import com.example.skillshare.model.LearningPlan;
import com.example.skillshare.security.UserDetailsImpl;
import com.example.skillshare.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @GetMapping
    public ResponseEntity<List<LearningPlan>> getAllLearningPlans() {
        return ResponseEntity.ok(learningPlanService.getAllLearningPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(learningPlanService.getLearningPlanById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningPlan>> getLearningPlansByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(learningPlanService.getLearningPlansByUser(userId));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<LearningPlan> createLearningPlan(@Valid @RequestBody LearningPlanRequest learningPlanRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(learningPlanService.createLearningPlan(learningPlanRequest, currentUser.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<LearningPlan> updateLearningPlan(@PathVariable Long id,
            @Valid @RequestBody LearningPlanRequest learningPlanRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(learningPlanService.updateLearningPlan(id, learningPlanRequest, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteLearningPlan(@PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        learningPlanService.deleteLearningPlan(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
