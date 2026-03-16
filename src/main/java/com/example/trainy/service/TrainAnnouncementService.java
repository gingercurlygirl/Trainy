package com.example.trainy.service;

import com.example.trainy.model.DelayStats;
import com.example.trainy.model.TrainAnnouncement;
import com.example.trainy.repository.TrainAnnouncementRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TrainAnnouncementService {

    TrainAnnouncementRepository trainAnnouncementRepository;

    public TrainAnnouncementService(TrainAnnouncementRepository trainAnnouncementRepository) {
        this.trainAnnouncementRepository = trainAnnouncementRepository;
    }

    public List<TrainAnnouncement> getAll(String station, String type) {
        Instant now = Instant.now();
        if (station != null && type != null) {
            return trainAnnouncementRepository.findByLocationSignatureAndActivityTypeFromTime(station, type, now);
        }
        if (station != null) {
            return trainAnnouncementRepository.findByLocationSignatureFromTime(station, now);
        }
        return trainAnnouncementRepository.findAll();
    }

    public List<String> getStations() {
        return trainAnnouncementRepository.findDistinctStations();
    }

    public DelayStats getStats(String station, String type) {
        List<TrainAnnouncement> all = getAll(station, type);

        long totalCount = all.size();
        long delayedCount = all.stream()
                .filter(a -> a.getDelayMinutes() != null && a.getDelayMinutes() > 0)
                .count();
        long onTimeCount = totalCount - delayedCount;
        double averageDelayMinutes = all.stream()
                .filter(a -> a.getDelayMinutes() != null && a.getDelayMinutes() > 0)
                .mapToLong(TrainAnnouncement::getDelayMinutes)
                .average()
                .orElse(0.0);
        long maxDelayMinutes = all.stream()
                .filter(a -> a.getDelayMinutes() != null)
                .mapToLong(TrainAnnouncement::getDelayMinutes)
                .max()
                .orElse(0L);

        return new DelayStats(totalCount, delayedCount, onTimeCount, averageDelayMinutes, maxDelayMinutes);
    }
}
