package com.ayursutra.dto.request;

import com.ayursutra.entity.TherapyDependency;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TherapyDependencyRequest {

    @NotBlank(message = "Therapy ID is required")
    private String therapyId;

    @NotBlank(message = "Related therapy ID is required")
    private String relatedTherapyId;

    @NotNull(message = "Dependency type is required")
    private TherapyDependency.DependencyType dependencyType;

    @Min(value = 0, message = "Minimum gap cannot be negative")
    private Integer minimumGapMinutes;

    private String description;

    private Boolean active;
}