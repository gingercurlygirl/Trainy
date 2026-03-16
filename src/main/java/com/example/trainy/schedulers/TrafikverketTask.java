package com.example.trainy.schedulers;

import com.example.trainy.model.TrainAnnouncement;
import com.example.trainy.repository.TrainAnnouncementRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.example.trainy.service.StationService;
import org.springframework.beans.factory.annotation.Value;
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
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class TrafikverketTask {

    private final RestTemplate restTemplate;
    private final TrainAnnouncementRepository trainAnnouncementRepository;
    private final StationService stationService;

    @Value("${trafikverket.stations}")
    private String[] stations;

    public TrafikverketTask(RestTemplate restTemplate, TrainAnnouncementRepository trainAnnouncementRepository, StationService stationService) {
        this.restTemplate = restTemplate;
        this.trainAnnouncementRepository = trainAnnouncementRepository;
        this.stationService = stationService;
    }

    @Scheduled(fixedRate = 60_000)
    public void run() {
        for (String station : stations) {
            String response = requestTrainAnnouncements(station.trim());
            if (response != null && !response.isEmpty()) {
                fillDatabase(response);
            }
        }
        stationService.invalidateCache();
    }

    private String requestTrainAnnouncements(String station) {
        String url = "https://api.trafikinfo.trafikverket.se/v2/data.json";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "xml", StandardCharsets.UTF_8));

        String api_key = System.getenv().getOrDefault("TRAFIKVERKET_API_KEY", "demokey");

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime end = now.plusDays(1).withHour(0).withMinute(0).withSecond(0);

        DateTimeFormatter fmt = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

        String from = now.format(fmt);
        String to = end.format(fmt);

        String htmlBody = String.format("""
                <REQUEST>
                  <LOGIN authenticationkey="%s"/>
                  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="100">
                    <FILTER>
                      <AND>
                        <EQ name="InformationOwner" value="Mälardalstrafik AB" />
                        <EQ name="LocationSignature" value="%s" />
                        <OR>
                          <AND>
                            <LT name="AdvertisedTimeAtLocation" value="%s" />
                            <GT name="AdvertisedTimeAtLocation" value="%s" />
                          </AND>
                          <AND>
                            <LT name="EstimatedTimeAtLocation" value="%s" />
                            <GT name="EstimatedTimeAtLocation" value="%s" />
                          </AND>
                        </OR>
                      </AND>
                    </FILTER>
                  </QUERY>
                </REQUEST>""", api_key, station, to, from, to, from);

        HttpEntity<String> request = new HttpEntity<>(htmlBody, headers);

        return restTemplate.postForObject(url, request, String.class);
    }

    private void fillDatabase(String response) {
        JsonNode root = JsonUtil.parseSafely(response);
        if (root == null) {
            return;
        }

        JsonNode announcements = root
                .path("RESPONSE")
                .path("RESULT")
                .get(0)
                .path("TrainAnnouncement");

        for (JsonNode announcement : announcements) {
            parseAnnouncement(announcement);
        }
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
                if (!desc.isBlank()) {
                    descriptions.add(desc);
                }
            }
            if (!descriptions.isEmpty()) {
                deviation = String.join("; ", descriptions);
            }
        }

        TrainAnnouncement trainAnnouncement = new TrainAnnouncement(
                activityId,
                advertisedTimeAtLocation,
                estimatedTimeAtLocation,
                locationSignature,
                advertisedTrainIden,
                trackAtLocation,
                toLocation,
                activityType,
                delayMinutes,
                canceled,
                deviation);

        trainAnnouncementRepository.save(trainAnnouncement);
    }
}
