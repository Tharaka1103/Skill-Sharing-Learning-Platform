package com.example.skillshare.dto;

//package com.skillshare.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.time.LocalDate;

@Data
public class LearningStepRequest {
    @NotBlank
    private String title;

    private String description;

    private String resources;

    private Boolean completed;

    private LocalDate targetDate;
}
