package com.example.trainy.schedulers;

import com.example.trainy.model.TrainAnnouncement;
import com.example.trainy.repository.TrainAnnouncementRepository;
import com.example.trainy.service.StationService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class TrafikverketTask {

    private final RestTemplate restTemplate;
    private final TrainAnnouncementRepository trainAnnouncementRepository;
    private final StationService stationService;

    private String[] discoveredStations = null;

    public TrafikverketTask(RestTemplate restTemplate, TrainAnnouncementRepository trainAnnouncementRepository, StationService stationService) {
        this.restTemplate = restTemplate;
        this.trainAnnouncementRepository = trainAnnouncementRepository;
        this.stationService = stationService;
    }

    private synchronized String[] getStations() {
        if (discoveredStations == null) {
            discoveredStations = discoverStationCodes();
        }
        return discoveredStations;
    }

    private String[] discoverStationCodes() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime from = now.minusHours(24);
        DateTimeFormatter fmt = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

        String url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "xml", StandardCharsets.UTF_8));
        String apiKey = System.getenv().getOrDefault("TRAFIKVERKET_API_KEY", "d17037d4c3494dc5931a9bebfcd89565");

        String body = String.format("""
                <REQUEST>
                  <LOGIN authenticationkey="%s"/>
                  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="5000">
                    <FILTER>
                      <AND>
                        <EQ name="InformationOwner" value="Mälardalstrafik AB" />
                        <GT name="AdvertisedTimeAtLocation" value="%s" />
                        <LT name="AdvertisedTimeAtLocation" value="%s" />
                      </AND>
                    </FILTER>
                    <INCLUDE>LocationSignature</INCLUDE>
                  </QUERY>
                </REQUEST>""", apiKey, from.format(fmt), now.format(fmt));

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        String response;
        try {
            response = restTemplate.postForObject(url, request, String.class);
        } catch (Exception e) {
            System.err.println("Failed to discover station codes: " + e.getMessage());
            return new String[0];
        }

        JsonNode root = JsonUtil.parseSafely(response);
        if (root == null) return new String[0];

        JsonNode announcements = root.path("RESPONSE").path("RESULT").get(0).path("TrainAnnouncement");
        Set<String> codes = new LinkedHashSet<>();
        for (JsonNode ann : announcements) {
            String code = ann.path("LocationSignature").asText();
            if (!code.isBlank()) codes.add(code);
        }
        System.out.println("Discovered Mälartåg stations: " + codes);
        return codes.toArray(new String[0]);
    }

    @Scheduled(fixedRate = 60_000)
    public void run() {
        try {
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            OffsetDateTime from = now.minusMinutes(30);
            OffsetDateTime endOfDay = now.atZoneSameInstant(ZoneId.of("Europe/Stockholm"))
                    .toLocalDate().plusDays(1).atStartOfDay(ZoneId.of("Europe/Stockholm"))
                    .plusHours(4)
                    .toOffsetDateTime()
                    .withOffsetSameInstant(ZoneOffset.UTC);

            for (String station : getStations()) {
                String response = fetchAnnouncements(station.trim(), from, endOfDay, 500);
                if (response != null && !response.isEmpty()) {
                    fillDatabase(response);
                }
            }
            stationService.invalidateCache();
        } catch (Exception e) {
            System.err.println("Scheduler run failed: " + e.getMessage());
        }
    }

    public int importHistorical(int hours) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime from = now.minusHours(hours);
        int totalSaved = 0;

        for (String station : getStations()) {
            String response = fetchAnnouncements(station.trim(), from, now, 1000);
            if (response != null && !response.isEmpty()) {
                totalSaved += fillDatabase(response);
            }
        }
        stationService.invalidateCache();
        return totalSaved;
    }

    private String fetchAnnouncements(String station, OffsetDateTime from, OffsetDateTime to, int limit) {
        String url = "https://api.trafikinfo.trafikverket.se/v2/data.json";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "xml", StandardCharsets.UTF_8));

        String apiKey = System.getenv().getOrDefault("TRAFIKVERKET_API_KEY", "d17037d4c3494dc5931a9bebfcd89565");
        DateTimeFormatter fmt = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

        String fromStr = from.format(fmt);
        String toStr = to.format(fmt);

        String body = String.format("""
                <REQUEST>
                  <LOGIN authenticationkey="%s"/>
                  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="%d">
                    <FILTER>
                      <AND>
                        <EQ name="InformationOwner" value="Mälardalstrafik AB" />
                        <EQ name="LocationSignature" value="%s" />
                        <GT name="AdvertisedTimeAtLocation" value="%s" />
                        <LT name="AdvertisedTimeAtLocation" value="%s" />
                      </AND>
                    </FILTER>
                  </QUERY>
                </REQUEST>""", apiKey, limit, station, fromStr, toStr);

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        try {
            return restTemplate.postForObject(url, request, String.class);
        } catch (Exception e) {
            System.err.println("Trafikverket API error for station " + station + ": " + e.getMessage());
            return null;
        }
    }

    private int fillDatabase(String response) {
        JsonNode root = JsonUtil.parseSafely(response);
        if (root == null) return 0;

        JsonNode announcements = root
                .path("RESPONSE")
                .path("RESULT")
                .get(0)
                .path("TrainAnnouncement");

        int count = 0;
        for (JsonNode announcement : announcements) {
            parseAnnouncement(announcement);
            count++;
        }
        return count;
    }

    private void parseAnnouncement(JsonNode announcement) {
        String activityId = announcement.path("ActivityId").asText();
        String locationSignature = announcement.path("LocationSignature").asText();
        String advertisedTrainIden = announcement.path("AdvertisedTrainIdent").asText();
        String trackAtLocation = announcement.path("TrackAtLocation").asText();
        String activityType = announcement.path("ActivityType").asText();

        JsonNode toLocationNode = announcement.path("ToLocation");
        String toLocation = (toLocationNode.isArray() && !toLocationNode.isEmpty())
                ? toLocationNode.get(0).path("LocationName").asText()
                : null;

        Instant advertisedTimeAtLocation = Instant.parse(announcement.path("AdvertisedTimeAtLocation").asText());
        Instant estimatedTimeAtLocation = null;
        Long delayMinutes = null;
        if (announcement.findValue("EstimatedTimeAtLocation") != null) {
            estimatedTimeAtLocation = Instant.parse(announcement.path("EstimatedTimeAtLocation").asText());
            delayMinutes = Duration.between(advertisedTimeAtLocation, estimatedTimeAtLocation).toMinutes();
        }

        Boolean canceled = announcement.path("Canceled").asBoolean(false);

        String deviation = null;
        JsonNode deviationNode = announcement.path("Deviation");
        if (deviationNode.isArray() && !deviationNode.isEmpty()) {
            List<String> descriptions = new ArrayList<>();
            for (JsonNode d : deviationNode) {
                String desc = d.path("Description").asText();
                if (!desc.isBlank()) descriptions.add(desc);
            }
            if (!descriptions.isEmpty()) deviation = String.join("; ", descriptions);
        }

        trainAnnouncementRepository.save(new TrainAnnouncement(
                activityId, advertisedTimeAtLocation, estimatedTimeAtLocation,
                locationSignature, advertisedTrainIden, trackAtLocation,
                toLocation, activityType, delayMinutes, canceled, deviation));
    }
}
