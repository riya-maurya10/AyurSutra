package com.ayursutra.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientProgressResponse {

    private String id;

    private String patientId;

    private String therapyPlanId;

    private LocalDate assessmentDate;

    private Integer dayNumber;

    private String symptoms;

    private String observations;

    private Integer improvementPercentage;

    private String therapyResponse;

    private String practitionerNotes;

    private String nextRecommendation;
}