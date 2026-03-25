package com.example.trainy.controller;

import com.example.trainy.model.DelayStats;
import com.example.trainy.model.StationInfo;
import com.example.trainy.schedulers.TrafikverketTask;
import com.example.trainy.service.StationService;
import com.example.trainy.service.TrainAnnouncementService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TrainAnnouncementController.class)
class TrainAnnouncementControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    TrainAnnouncementService trainAnnouncementService;

    @MockitoBean
    StationService stationService;

    @MockitoBean
    TrafikverketTask trafikverketTask;

    @Test
    void getStats_returns200WithJson() throws Exception {
        DelayStats stats = new DelayStats(100L, 5L, 20L, 75L, 7.5, 45L);
        when(trainAnnouncementService.getStats("Cst", "avgang")).thenReturn(stats);

        mockMvc.perform(get("/train_announcements/stats?station=Cst&type=avgang"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(100))
                .andExpect(jsonPath("$.canceledCount").value(5))
                .andExpect(jsonPath("$.delayedCount").value(20))
                .andExpect(jsonPath("$.onTimeCount").value(75));
    }

    @Test
    void getStations_returns200WithList() throws Exception {
        when(stationService.getAllStations()).thenReturn(List.of(
                new StationInfo("Cst", "Stockholm C"),
                new StationInfo("U", "Uppsala C")
        ));

        mockMvc.perform(get("/train_announcements/stations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("Cst"))
                .andExpect(jsonPath("$[0].name").value("Stockholm C"))
                .andExpect(jsonPath("$[1].code").value("U"));
    }

    @Test
    void importHistorical_callsTaskAndReturnsResult() throws Exception {
        when(trafikverketTask.importHistorical(24)).thenReturn(500);

        mockMvc.perform(post("/train_announcements/import?hours=24"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processed").value(500))
                .andExpect(jsonPath("$.hours").value(24));
    }
}
