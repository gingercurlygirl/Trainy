package com.example.trainy.controller;

import com.example.trainy.model.DelayStats;
import com.example.trainy.model.StationInfo;
import com.example.trainy.model.TrainAnnouncement;
import com.example.trainy.schedulers.TrafikverketTask;
import com.example.trainy.service.StationService;
import com.example.trainy.service.TrainAnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/train_announcements")
@RestController
public class TrainAnnouncementController {

    private final TrainAnnouncementService trainAnnouncementService;
    private final StationService stationService;
    private final TrafikverketTask trafikverketTask;

    public TrainAnnouncementController(TrainAnnouncementService trainAnnouncementService, StationService stationService, TrafikverketTask trafikverketTask) {
        this.trainAnnouncementService = trainAnnouncementService;
        this.stationService = stationService;
        this.trafikverketTask = trafikverketTask;
    }

    @GetMapping()
    public ResponseEntity<List<TrainAnnouncement>> getAll(
            @RequestParam(required = false) String station,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "false") boolean history) {
        if (history) {
            return ResponseEntity.ok(trainAnnouncementService.getAllHistorical(station, type));
        }
        return ResponseEntity.ok(trainAnnouncementService.getAll(station, type));
    }

    @GetMapping("/stats")
    public ResponseEntity<DelayStats> getStats(
            @RequestParam(required = false) String station,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(trainAnnouncementService.getStats(station, type));
    }

    @GetMapping("/stations")
    public ResponseEntity<List<StationInfo>> getStations() {
        return ResponseEntity.ok(stationService.getAllStations());
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importHistorical(
            @RequestParam(defaultValue = "48") int hours) {
        int saved = trafikverketTask.importHistorical(hours);
        return ResponseEntity.ok(Map.of(
                "message", "Import klar",
                "hours", hours,
                "processed", saved
        ));
    }
}
