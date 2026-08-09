package com.ayursutra.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapyPlanItem {

    private Integer day;

    private String therapyId;

    private String therapyName;

    private Integer durationMinutes;

    private Integer sequenceOrder;
}