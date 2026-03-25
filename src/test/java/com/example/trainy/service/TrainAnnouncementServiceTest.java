package com.example.trainy.service;

import com.example.trainy.model.DelayStats;
import com.example.trainy.repository.TrainAnnouncementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrainAnnouncementServiceTest {

    @Mock
    TrainAnnouncementRepository repository;

    @InjectMocks
    TrainAnnouncementService service;

    @Test
    void getStats_returnsCorrectCounts() {
        when(repository.countByStationAndType("Cst", "Avgang")).thenReturn(100L);
        when(repository.countCanceledByStationAndType("Cst", "Avgang")).thenReturn(5L);
        when(repository.countDelayedByStationAndType("Cst", "Avgang")).thenReturn(20L);
        when(repository.avgDelayByStationAndType("Cst", "Avgang")).thenReturn(7.5);
        when(repository.maxDelayByStationAndType("Cst", "Avgang")).thenReturn(45L);

        DelayStats stats = service.getStats("Cst", "avgang");

        assertEquals(100L, stats.getTotalCount());
        assertEquals(5L, stats.getCanceledCount());
        assertEquals(20L, stats.getDelayedCount());
        assertEquals(75L, stats.getOnTimeCount());
        assertEquals(7.5, stats.getAverageDelayMinutes());
        assertEquals(45L, stats.getMaxDelayMinutes());
    }

    @Test
    void getStats_noDelays_returnsZeroAverageAndMax() {
        when(repository.countByStationAndType("Cst", "Avgang")).thenReturn(10L);
        when(repository.countCanceledByStationAndType("Cst", "Avgang")).thenReturn(0L);
        when(repository.countDelayedByStationAndType("Cst", "Avgang")).thenReturn(0L);
        when(repository.avgDelayByStationAndType("Cst", "Avgang")).thenReturn(null);
        when(repository.maxDelayByStationAndType("Cst", "Avgang")).thenReturn(null);

        DelayStats stats = service.getStats("Cst", "avgang");

        assertEquals(0.0, stats.getAverageDelayMinutes());
        assertEquals(0L, stats.getMaxDelayMinutes());
        assertEquals(10L, stats.getOnTimeCount());
    }

    @Test
    void getStats_normalizesActivityType() {
        when(repository.countByStationAndType("Cst", "Ankomst")).thenReturn(50L);
        when(repository.countCanceledByStationAndType("Cst", "Ankomst")).thenReturn(0L);
        when(repository.countDelayedByStationAndType("Cst", "Ankomst")).thenReturn(0L);
        when(repository.avgDelayByStationAndType("Cst", "Ankomst")).thenReturn(null);
        when(repository.maxDelayByStationAndType("Cst", "Ankomst")).thenReturn(null);

        DelayStats stats = service.getStats("Cst", "ANKOMST");

        assertEquals(50L, stats.getTotalCount());
        verify(repository).countByStationAndType("Cst", "Ankomst");
    }
}
