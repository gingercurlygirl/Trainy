package com.example.trainy.service;

import com.example.trainy.model.TrainStation;
import com.example.trainy.repository.TrainStationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainStationService {

    TrainStationRepository trainStationRepository;

    public TrainStationService(TrainStationRepository trainStationRepository) {
        this.trainStationRepository = trainStationRepository;
    }

    public List<TrainStation> getAllTrainStations() {
        return trainStationRepository.findAll();
    }
}
