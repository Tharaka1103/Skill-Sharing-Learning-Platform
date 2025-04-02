package com.example.skillshare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private String message;

    // This is a simple utility class to return message responses
    // from API endpoints (success messages, error messages, etc.)
}
