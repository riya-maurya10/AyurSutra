package com.ayursutra.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultiDayScheduleResponse {

    private boolean success;

    private String message;

    private String therapyPlanId;

    private int totalSessionsCreated;

    private List<TherapySessionResponse> sessions;
}