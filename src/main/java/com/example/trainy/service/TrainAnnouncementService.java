package com.example.trainy.service;

import com.example.trainy.model.TrainAnnouncement;
import com.example.trainy.repository.TrainAnnouncementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainAnnouncementService {

    TrainAnnouncementRepository trainAnnouncementRepository;

    public TrainAnnouncementService(TrainAnnouncementRepository trainAnnouncementRepository) {
        this.trainAnnouncementRepository = trainAnnouncementRepository;
    }

    public List<TrainAnnouncement> getAllTrainAnnouncements() {
        return trainAnnouncementRepository.findAll();
    }
}
