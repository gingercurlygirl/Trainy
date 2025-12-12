package com.example.trainy.repository;

import com.example.trainy.model.TrainStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainStationRepository extends JpaRepository<TrainStation, Long> {
    Optional<TrainStation> findByOfficialLocationName(String officialLocationName);
}