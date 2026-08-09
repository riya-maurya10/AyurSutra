package com.ayursutra.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TherapyResponse {

    private String id;

    private String name;

    private String stage;

    private String description;

    private Integer durationMinutes;

    private Boolean active;
}