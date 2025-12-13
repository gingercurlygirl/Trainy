package com.example.trainy.schedulers;

import com.example.trainy.repository.TrainAnnouncementRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Component
public class TrafikverketTask {

    private final RestTemplate restTemplate;
    private final TrainAnnouncementRepository trainAnnouncementRepository; // TODO: use me!

    public TrafikverketTask(RestTemplate restTemplate, TrainAnnouncementRepository trainAnnouncementRepository) {
        this.restTemplate = restTemplate;
        this.trainAnnouncementRepository = trainAnnouncementRepository;
    }

    @Scheduled(fixedRate = 60_000)
    public void run() {
        System.out.println("Task running every 60 seconds...");
        String url = "https://api.trafikinfo.trafikverket.se/v2/data.json";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "xml", StandardCharsets.UTF_8));

        String api_key = System.getenv().getOrDefault("TRAFIKVERKET_API_KEY", "demokey");

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime end = now.plusDays(2).withHour(12).withMinute(0).withSecond(0);

        DateTimeFormatter fmt = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

        String from = now.format(fmt);
        String to = end.format(fmt);

        String htmlBody = String.format("""
                <REQUEST>
                  <LOGIN authenticationkey="%s"/>
                  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="10">
                    <FILTER>
                      <AND>
                        <EQ name="InformationOwner" value="Mälardalstrafik AB" />
                        <EQ name="LocationSignature" value="Vhd" />
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
                </REQUEST>""", api_key, to, from, to, from);

        HttpEntity<String> request = new HttpEntity<>(htmlBody, headers);

        String responseJson = restTemplate.postForObject(url, request, String.class);

        System.out.println("Received JSON: " + responseJson);
    }
}