package com.example.trainy.controller;

import com.example.trainy.model.DelayStats;
import com.example.trainy.model.TrainAnnouncement;
import com.example.trainy.service.TrainAnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public ResponseEntity<List<TrainAnnouncement>> getAllTrainAnnouncements() {
        return ResponseEntity.ok(trainAnnouncementService.getAllTrainAnnouncements());
    }

    @GetMapping("/stats")
    public ResponseEntity<DelayStats> getStats() {
        return ResponseEntity.ok(trainAnnouncementService.getStats());
    }

}
