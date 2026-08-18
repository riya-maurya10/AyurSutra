package com.ayursutra.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "patient_progress")
public class PatientProgress {

    @Id
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