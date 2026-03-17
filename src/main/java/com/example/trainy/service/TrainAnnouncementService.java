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
        String normalizedType = normalize(type);
        if (station != null && normalizedType != null) {
            return trainAnnouncementRepository.findByLocationSignatureAndActivityTypeFromTime(station, normalizedType, now);
        }
        if (station != null) {
            return trainAnnouncementRepository.findByLocationSignatureFromTime(station, now);
        }
        return trainAnnouncementRepository.findAll();
    }

    public List<TrainAnnouncement> getAllHistorical(String station, String type) {
        String normalizedType = normalize(type);
        if (station != null && normalizedType != null) {
            return trainAnnouncementRepository.findByLocationSignatureAndActivityType(station, normalizedType);
        }
        if (station != null) {
            return trainAnnouncementRepository.findByLocationSignature(station);
        }
        return trainAnnouncementRepository.findAll();
    }

    private String normalize(String type) {
        if (type == null) return null;
        return Character.toUpperCase(type.charAt(0)) + type.substring(1).toLowerCase();
    }

    public List<String> getStations() {
        return trainAnnouncementRepository.findDistinctStations();
    }

    public DelayStats getStats(String station, String type) {
        List<TrainAnnouncement> all = getAllHistorical(station, type);

        long totalCount = all.size();
        long canceledCount = all.stream()
                .filter(a -> Boolean.TRUE.equals(a.isCanceled()))
                .count();
        long delayedCount = all.stream()
                .filter(a -> !Boolean.TRUE.equals(a.isCanceled()) && a.getDelayMinutes() != null && a.getDelayMinutes() > 0)
                .count();
        long onTimeCount = totalCount - canceledCount - delayedCount;
        double averageDelayMinutes = all.stream()
                .filter(a -> !Boolean.TRUE.equals(a.isCanceled()) && a.getDelayMinutes() != null && a.getDelayMinutes() > 0)
                .mapToLong(TrainAnnouncement::getDelayMinutes)
                .average()
                .orElse(0.0);
        long maxDelayMinutes = all.stream()
                .filter(a -> a.getDelayMinutes() != null)
                .mapToLong(TrainAnnouncement::getDelayMinutes)
                .max()
                .orElse(0L);

        return new DelayStats(totalCount, canceledCount, delayedCount, onTimeCount, averageDelayMinutes, maxDelayMinutes);
    }
}
