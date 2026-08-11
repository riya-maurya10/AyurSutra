package com.ayursutra.entity;

import com.ayursutra.constant.TherapySessionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "therapy_sessions")
public class TherapySession {

    @Id
    private String id;

    private String therapyPlanId;

    private String patientId;

    private String therapistId;

    private String therapyId;

    private String roomId;

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