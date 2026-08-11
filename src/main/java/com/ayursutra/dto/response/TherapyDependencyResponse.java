package com.ayursutra.dto.response;

import com.ayursutra.entity.TherapyDependency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TherapyDependencyResponse {

    private String id;

    private String therapyId;

    private String relatedTherapyId;

    private TherapyDependency.DependencyType dependencyType;

    private Integer minimumGapMinutes;

    private String description;

    private Boolean active;
}