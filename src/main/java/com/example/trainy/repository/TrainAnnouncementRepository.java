package com.example.trainy.repository;

import com.example.trainy.model.TrainAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainAnnouncementRepository extends JpaRepository<TrainAnnouncement, String> {

    List<TrainAnnouncement> findByLocationSignature(String locationSignature);

    List<TrainAnnouncement> findByLocationSignatureAndActivityType(String locationSignature, String activityType);

    @Query("SELECT DISTINCT t.locationSignature FROM TrainAnnouncement t ORDER BY t.locationSignature")
    List<String> findDistinctStations();
}
