package com.example.trainy.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(name = "trafikverket")
public class TrainAnnouncement {
    @Id
    private Long id;
    @Column(name = "activity_id", nullable = false)
    private String activityId;

    @Column(name = "advertised_time_at_location")
    private LocalDateTime advertisedTimeAtLocation;

    @Column(name = "estimated_time_at_location")
    private LocalDateTime estimatedTimeAtLocation;

    @Column(name = "location_signature", length = 10)
    private String locationSignature;

    @Column(name = "advertised_train_iden")
    private String advertisedTrainIden;

    @Column(name = "track_at_location")
    private String trackAtLocation;

    @Column(name = "to_location")
    private String toLocation;

    @Column(name = "modified_time")
    private LocalDateTime modifiedTime;

    @Column(name = "activity_type")
    private String activity_type;



    public LocalDateTime getModifiedTime() {
        return modifiedTime;
    }

    public void setModifiedTime(LocalDateTime modifiedTime) {
        this.modifiedTime = modifiedTime;
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

    public LocalDateTime getEstimatedTimeAtLocation() {
        return estimatedTimeAtLocation;
    }

    public void setEstimatedTimeAtLocation(LocalDateTime estimatedTimeAtLocation) {
        this.estimatedTimeAtLocation = estimatedTimeAtLocation;
    }

    public LocalDateTime getAdvertisedTimeAtLocation() {
        return advertisedTimeAtLocation;
    }

    public void setAdvertisedTimeAtLocation(LocalDateTime advertisedTimeAtLocation) {
        this.advertisedTimeAtLocation = advertisedTimeAtLocation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActivityId() {
        return activityId;
    }

    public void setActivityId(String activityId) {
        this.activityId = activityId;
    }

}
