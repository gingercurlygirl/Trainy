package com.example.trainy.service;

import com.example.trainy.model.StationInfo;
import com.example.trainy.repository.TrainAnnouncementRepository;
import com.example.trainy.schedulers.JsonUtil;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StationService {

    private final RestTemplate restTemplate;
    private final TrainAnnouncementRepository repository;

    private List<StationInfo> cache = null;

    public StationService(RestTemplate restTemplate, TrainAnnouncementRepository repository) {
        this.restTemplate = restTemplate;
        this.repository = repository;
    }

    public synchronized List<StationInfo> getAllStations() {
        if (cache != null) {
            return cache;
        }

        Set<String> codes = new LinkedHashSet<>();
        codes.addAll(repository.findDistinctStations());
        codes.addAll(repository.findDistinctToLocations());

        if (codes.isEmpty()) {
            return List.of();
        }

        String response = queryTrafikverket(codes);
        cache = parseResponse(response);
        return cache;
    }

    public synchronized void invalidateCache() {
        cache = null;
    }

    private String queryTrafikverket(Set<String> codes) {
        String url = "https://api.trafikinfo.trafikverket.se/v2/data.json";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "xml", StandardCharsets.UTF_8));

        String apiKey = System.getenv().getOrDefault("TRAFIKVERKET_API_KEY", "demokey");

        String eqNodes = codes.stream()
                .map(code -> String.format("<EQ name=\"LocationSignature\" value=\"%s\" />", code))
                .collect(Collectors.joining("\n        "));

        String body = String.format("""
                <REQUEST>
                  <LOGIN authenticationkey="%s"/>
                  <QUERY objecttype="TrainStation" schemaversion="1">
                    <FILTER>
                      <OR>
                        %s
                      </OR>
                    </FILTER>
                    <INCLUDE>LocationSignature</INCLUDE>
                    <INCLUDE>AdvertisedLocationName</INCLUDE>
                  </QUERY>
                </REQUEST>""", apiKey, eqNodes);

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        try {
            return restTemplate.postForObject(url, request, String.class);
        } catch (Exception e) {
            System.err.println("Trafikverket station API error: " + e.getMessage());
            return null;
        }
    }

    private List<StationInfo> parseResponse(String response) {
        JsonNode root = JsonUtil.parseSafely(response);
        if (root == null) return List.of();

        JsonNode stations = root
                .path("RESPONSE")
                .path("RESULT")
                .get(0)
                .path("TrainStation");

        List<StationInfo> result = new ArrayList<>();
        for (JsonNode station : stations) {
            String code = station.path("LocationSignature").asText();
            String name = station.path("AdvertisedLocationName").asText();
            if (!code.isBlank() && !name.isBlank()) {
                result.add(new StationInfo(code, name));
            }
        }

        result.sort(Comparator.comparing(StationInfo::getName));
        return result;
    }
}
