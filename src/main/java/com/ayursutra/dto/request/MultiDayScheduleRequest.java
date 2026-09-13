package com.ayursutra.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultiDayScheduleRequest {

    @NotBlank(message = "Therapy plan ID is required")
    private String therapyPlanId;

    @NotEmpty(message = "At least one session is required")
    @Valid
    private List<MultiDaySessionRequest> sessions;


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MultiDaySessionRequest {

        @NotBlank(message = "Therapy ID is required")
        private String therapyId;

        private LocalDate sessionDate;

        private LocalTime startTime;

        private String therapistId;

        private String roomId;

        private String notes;
    }
}