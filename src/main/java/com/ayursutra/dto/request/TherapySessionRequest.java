package com.ayursutra.dto.request;

import com.ayursutra.constant.TherapySessionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TherapySessionRequest {

    @NotBlank
    private String therapyPlanId;

    @NotBlank
    private String patientId;

    private String therapistId;

    @NotBlank
    private String therapyId;

    @NotBlank
    private String therapyName;

    @NotNull
    private Integer dayNumber;

    @NotNull
    private Integer sequenceOrder;

    @NotNull
    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @NotNull
    private Integer plannedDurationMinutes;

    private Integer actualDurationMinutes;

    private TherapySessionStatus status;

    private String notes;
}