package com.example.skillshare.dto;

//package com.skillshare.dto;

import com.example.skillshare.model.PostType;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Data
public class PostRequest {
    @NotBlank
    @Size(max = 500)
    private String content;

    @NotNull
    private PostType type;

    private List<MediaRequest> media;

    // For learning plans
    private LearningPlanRequest learningPlan;
}
