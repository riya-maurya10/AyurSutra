package com.ayursutra.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultiDayScheduleRequest {

    @NotBlank(message = "Therapy plan ID is required")
    private String therapyPlanId;
}