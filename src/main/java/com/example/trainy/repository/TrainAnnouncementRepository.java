package com.example.trainy.repository;

import com.example.trainy.model.TrainAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainAnnouncementRepository extends JpaRepository<TrainAnnouncement, String> {
}
