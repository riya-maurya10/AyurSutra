package com.ayursutra.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class DietPlanRequest {

    @NotBlank
    private String patientId;

    private String therapyPlanId;

    @NotBlank
    private String doctorId;

    @NotBlank
    private String planName;

    private String diagnosis;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String status;

    private String notes;

    @Valid
    private List<DietPlanDayRequest> days;
}