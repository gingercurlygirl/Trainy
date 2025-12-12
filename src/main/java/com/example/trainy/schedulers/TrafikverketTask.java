package com.example.trainy.schedulers;

import com.example.trainy.repository.TrainStationRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class TrafikverketTask {

    private final RestTemplate restTemplate;
    private final TrainStationRepository trainStationRepository; // TODO: use me!

    public TrafikverketTask(RestTemplate restTemplate, TrainStationRepository trainStationRepository) {
        this.restTemplate = restTemplate;
        this.trainStationRepository = trainStationRepository;
    }

    @Scheduled(fixedRate = 60_000)
    public void run() {
        System.out.println("Task running every 60 seconds...");
        String url = "https://api.trafikinfo.trafikverket.se/v2/data.json";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_HTML);

        String api_key = System.getenv().getOrDefault("TRAFIKVERKET_API_KEY", "demokey");

        String htmlBody = String.format("""
                <REQUEST>
                  <LOGIN authenticationkey="%s"/>
                  <QUERY objecttype="TrainStationMessage" namespace="rail.trafficinfo" schemaversion="1" limit="10">
                    <FILTER></FILTER>
                  </QUERY>
                </REQUEST>""", api_key);

        HttpEntity<String> request = new HttpEntity<>(htmlBody, headers);

        String responseJson = restTemplate.postForObject(url, request, String.class);

        System.out.println("Received JSON: " + responseJson);
    }
}