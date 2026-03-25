package com.example.trainy.schedulers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtil {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static JsonNode parseSafely(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return MAPPER.readTree(json);
        } catch (Exception e) {
            System.err.println("Failed to parse JSON response: " + e.getMessage());
            return null;
        }
    }
}
