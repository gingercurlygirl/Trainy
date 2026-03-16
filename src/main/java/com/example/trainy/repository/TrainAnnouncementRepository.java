package com.example.trainy.repository;

import com.example.trainy.model.TrainAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface TrainAnnouncementRepository extends JpaRepository<TrainAnnouncement, String> {

    @Query("""
        SELECT t FROM TrainAnnouncement t
        WHERE t.locationSignature = :station
        AND (t.advertisedTimeAtLocation >= :from
             OR (t.estimatedTimeAtLocation IS NOT NULL AND t.estimatedTimeAtLocation >= :from))
        """)
    List<TrainAnnouncement> findByLocationSignatureFromTime(
            @Param("station") String station,
            @Param("from") Instant from);

    @Query("""
        SELECT t FROM TrainAnnouncement t
        WHERE t.locationSignature = :station
        AND t.activityType = :type
        AND (t.advertisedTimeAtLocation >= :from
             OR (t.estimatedTimeAtLocation IS NOT NULL AND t.estimatedTimeAtLocation >= :from))
        """)
    List<TrainAnnouncement> findByLocationSignatureAndActivityTypeFromTime(
            @Param("station") String station,
            @Param("type") String type,
            @Param("from") Instant from);

    @Query("SELECT DISTINCT t.locationSignature FROM TrainAnnouncement t ORDER BY t.locationSignature")
    List<String> findDistinctStations();

    @Query("SELECT DISTINCT t.toLocation FROM TrainAnnouncement t WHERE t.toLocation IS NOT NULL ORDER BY t.toLocation")
    List<String> findDistinctToLocations();
}
