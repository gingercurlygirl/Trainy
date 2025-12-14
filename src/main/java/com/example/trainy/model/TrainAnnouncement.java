package com.example.trainy.model;


import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "trafikverket")
public class TrainAnnouncement {
    @Id
    @Column(name = "activity_id", length = 36, nullable = false)
    private String activityId;

    @Column(
            name = "advertised_time_at_location",
            nullable = false,
            columnDefinition = "TIMESTAMP(3)"
    )
    private Instant advertisedTimeAtLocation;

    @Column(
            name = "estimated_time_at_location",
            columnDefinition = "TIMESTAMP(3)"
    )
    private Instant estimatedTimeAtLocation;

    @Column(name = "location_signature", length = 10)
    private String locationSignature;

    @Column(name = "advertised_train_iden", length = 20)
    private String advertisedTrainIden;

    @Column(name = "track_at_location", length = 10)
    private String trackAtLocation;

    @Column(name = "to_location", length = 10)
    private String toLocation;

    @Column(name = "activity_type", length = 50)
    private String activityType;

    public TrainAnnouncement(String activityId, Instant advertisedTimeAtLocation, Instant estimatedTimeAtLocation, String locationSignature, String advertisedTrainIden, String trackAtLocation, String toLocation, String activityType) {
        this.activityId = activityId;
        this.advertisedTimeAtLocation = advertisedTimeAtLocation;
        this.estimatedTimeAtLocation = estimatedTimeAtLocation;
        this.locationSignature = locationSignature;
        this.advertisedTrainIden = advertisedTrainIden;
        this.trackAtLocation = trackAtLocation;
        this.toLocation = toLocation;
        this.activityType = activityType;
    }

    public TrainAnnouncement() {

    }

    public String getToLocation() {
        return toLocation;
    }

    public void setToLocation(String toLocation) {
        this.toLocation = toLocation;
    }

    public String getTrackAtLocation() {
        return trackAtLocation;
    }

    public void setTrackAtLocation(String trackAtLocation) {
        this.trackAtLocation = trackAtLocation;
    }

    public String getAdvertisedTrainIden() {
        return advertisedTrainIden;
    }

    public void setAdvertisedTrainIden(String advertisedTrainIden) {
        this.advertisedTrainIden = advertisedTrainIden;
    }

    public String getLocationSignature() {
        return locationSignature;
    }

    public void setLocationSignature(String locationSignature) {
        this.locationSignature = locationSignature;
    }

    public Instant getEstimatedTimeAtLocation() {
        return estimatedTimeAtLocation;
    }

    public void setEstimatedTimeAtLocation(Instant estimatedTimeAtLocation) {
        this.estimatedTimeAtLocation = estimatedTimeAtLocation;
    }

    public Instant getAdvertisedTimeAtLocation() {
        return advertisedTimeAtLocation;
    }

    public void setAdvertisedTimeAtLocation(Instant advertisedTimeAtLocation) {
        this.advertisedTimeAtLocation = advertisedTimeAtLocation;
    }

    public String getActivityId() {
        return activityId;
    }

    public void setActivityId(String activityId) {
        this.activityId = activityId;
    }

}
