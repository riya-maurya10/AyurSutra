package com.ayursutra.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class DietPlanDayRequest {

    @NotNull
    private Integer dayNumber;

    @NotNull
    private LocalDate date;

    private String phase;

    @Valid
    private List<DietMealRequest> meals;
}