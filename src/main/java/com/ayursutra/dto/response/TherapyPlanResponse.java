package com.ayursutra.dto.response;

import com.ayursutra.entity.TherapyPlanItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapyPlanResponse {

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