package com.ayursutra.dto.response;

import com.ayursutra.entity.DietPlanDay;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DietPlanResponse {

    private String id;

    private String patientId;

    private String therapyPlanId;

    private String doctorId;

    private String planName;

    private String diagnosis;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;

    private String notes;

    private List<DietPlanDay> days;
}