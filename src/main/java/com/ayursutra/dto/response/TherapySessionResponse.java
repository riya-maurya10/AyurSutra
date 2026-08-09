package com.ayursutra.dto.response;

import com.ayursutra.constant.TherapySessionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapySessionResponse {

    private String id;

    private String therapyPlanId;

    private String patientId;

    private String therapistId;

    private String therapyId;

    private String therapyName;

    private Integer dayNumber;

    private Integer sequenceOrder;

    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Integer plannedDurationMinutes;

    private Integer actualDurationMinutes;

    private TherapySessionStatus status;

    private String notes;
}