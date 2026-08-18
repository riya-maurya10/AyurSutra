package com.ayursutra.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DietPlanDay {

    private Integer dayNumber;

    private LocalDate date;

    /*
     * Example:
     * SAMSARJANA
     * REGULAR
     * POST_THERAPY
     *
     * Kept configurable because the actual
     * dietary protocol is decided by the doctor.
     */
    private String phase;

    private List<DietMeal> meals;
}