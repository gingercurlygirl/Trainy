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
            // log, wrap, or rethrow depending on your needs
            throw new IllegalArgumentException("Invalid JSON input", e);
        }
    }
}
