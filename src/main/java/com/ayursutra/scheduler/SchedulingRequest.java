package com.ayursutra.scheduler;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SchedulingRequest {

    @NotBlank
    private String therapyPlanId;

    @NotBlank
    private String therapyId;

    @NotNull
    private LocalDate sessionDate;

    @NotNull
    private LocalTime startTime;

    private String therapistId;

    private String roomId;

    private String notes;
}