package com.example.trainy.service;

import com.example.trainy.model.DelayStats;
import com.example.trainy.model.TrainAnnouncement;
import com.example.trainy.repository.TrainAnnouncementRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;


@Service
public class TrainAnnouncementService {

    private final TrainAnnouncementRepository trainAnnouncementRepository;

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
        String normalizedType = normalize(type);
        long totalCount = trainAnnouncementRepository.countByStationAndType(station, normalizedType);
        long canceledCount = trainAnnouncementRepository.countCanceledByStationAndType(station, normalizedType);
        long delayedCount = trainAnnouncementRepository.countDelayedByStationAndType(station, normalizedType);
        long onTimeCount = totalCount - canceledCount - delayedCount;
        Double avg = trainAnnouncementRepository.avgDelayByStationAndType(station, normalizedType);
        double averageDelayMinutes = avg != null ? avg : 0.0;
        Long max = trainAnnouncementRepository.maxDelayByStationAndType(station, normalizedType);
        long maxDelayMinutes = max != null ? max : 0L;
        return new DelayStats(totalCount, canceledCount, delayedCount, onTimeCount, averageDelayMinutes, maxDelayMinutes);
    }
}
