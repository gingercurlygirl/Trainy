package com.example.trainy.controller;

import com.example.trainy.model.DelayStats;
import com.example.trainy.model.TrainAnnouncement;
import com.example.trainy.service.TrainAnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/train_announcements")
@RestController
public class TrainAnnouncementController {

    TrainAnnouncementService trainAnnouncementService;

    public TrainAnnouncementController(TrainAnnouncementService trainAnnouncementService) {
        this.trainAnnouncementService = trainAnnouncementService;
    }

    @GetMapping()
    public ResponseEntity<List<TrainAnnouncement>> getAll(
            @RequestParam(required = false) String station,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(trainAnnouncementService.getAll(station, type));
    }

    @GetMapping("/stats")
    public ResponseEntity<DelayStats> getStats(
            @RequestParam(required = false) String station,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(trainAnnouncementService.getStats(station, type));
    }

    @GetMapping("/stations")
    public ResponseEntity<List<String>> getStations() {
        return ResponseEntity.ok(trainAnnouncementService.getStations());
    }
}
