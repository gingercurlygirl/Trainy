package com.example.trainy.schedulers;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JsonUtilTest {

    @Test
    void parseSafely_validJson_returnsNode() {
        String json = "{\"key\": \"value\"}";
        JsonNode result = JsonUtil.parseSafely(json);
        assertNotNull(result);
        assertEquals("value", result.path("key").asText());
    }

    @Test
    void parseSafely_invalidJson_returnsNull() {
        String json = "not valid json {{";
        JsonNode result = JsonUtil.parseSafely(json);
        assertNull(result);
    }

    @Test
    void parseSafely_nullInput_returnsNull() {
        assertNull(JsonUtil.parseSafely(null));
    }

    @Test
    void parseSafely_blankInput_returnsNull() {
        assertNull(JsonUtil.parseSafely("   "));
    }
}
