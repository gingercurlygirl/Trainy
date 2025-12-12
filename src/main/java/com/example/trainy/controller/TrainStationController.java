package com.example.trainy.controller;

import com.example.trainy.model.TrainStation;
import com.example.trainy.service.TrainStationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/train_stations")
@RestController
public class TrainStationController {

    TrainStationService trainStationService;

    public TrainStationController(TrainStationService trainStationService) {
        this.trainStationService = trainStationService;
    }

    @GetMapping()
    public ResponseEntity<List<TrainStation>> getAllTrainStations() {
        return ResponseEntity.ok(trainStationService.getAllTrainStations());
    }

}
