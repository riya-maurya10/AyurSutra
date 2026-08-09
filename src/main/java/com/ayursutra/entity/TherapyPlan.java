package com.ayursutra.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "therapy_plans")
public class TherapyPlan {

    @Id
    private String id;

    private String patientId;

    private String doctorId;

    private String planName;

    private String diagnosis;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;

    private List<TherapyPlanItem> therapies;
}