package com.ayursutra.scheduler;

import com.ayursutra.dto.response.TherapySessionResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchedulingResponse {

    private boolean success;

    private String message;

    private TherapySessionResponse session;
}