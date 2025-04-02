package com.example.skillshare.dto;

//package com.skillshare.dto;

import com.example.skillshare.model.MediaType;
import lombok.Data;

@Data
public class MediaRequest {
    private String url;
    private MediaType type;
}
