package com.ayursutra.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientProgressRequest {

    @NotBlank
    private String patientId;

    @NotBlank
    private String therapyPlanId;

    @NotNull
    private LocalDate assessmentDate;

    @NotNull
    @Min(1)
    private Integer dayNumber;

    private String symptoms;

    private String observations;

    @Min(0)
    @Max(100)
    private Integer improvementPercentage;

    private String therapyResponse;

    private String practitionerNotes;

    private String nextRecommendation;
}