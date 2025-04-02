package com.example.skillshare.dto;

//package com.skillshare.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;

@Data
public class LearningPlanRequest {
    @NotBlank
    private String title;

    private String description;

    private LocalDate completionTarget;

    private List<LearningStepRequest> steps;
}
