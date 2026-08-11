package com.ayursutra.mapper;

import com.ayursutra.dto.request.TherapyDependencyRequest;
import com.ayursutra.dto.response.TherapyDependencyResponse;
import com.ayursutra.entity.TherapyDependency;
import org.springframework.stereotype.Component;

@Component
public class TherapyDependencyMapper {

    public TherapyDependency toEntity(TherapyDependencyRequest request) {

        return TherapyDependency.builder()
                .therapyId(request.getTherapyId())
                .relatedTherapyId(request.getRelatedTherapyId())
                .dependencyType(request.getDependencyType())
                .minimumGapMinutes(request.getMinimumGapMinutes())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
    }

    public TherapyDependencyResponse toResponse(TherapyDependency entity) {

        return TherapyDependencyResponse.builder()
                .id(entity.getId())
                .therapyId(entity.getTherapyId())
                .relatedTherapyId(entity.getRelatedTherapyId())
                .dependencyType(entity.getDependencyType())
                .minimumGapMinutes(entity.getMinimumGapMinutes())
                .description(entity.getDescription())
                .active(entity.getActive())
                .build();
    }

    public void updateEntity(
            TherapyDependency entity,
            TherapyDependencyRequest request
    ) {

        entity.setTherapyId(request.getTherapyId());
        entity.setRelatedTherapyId(request.getRelatedTherapyId());
        entity.setDependencyType(request.getDependencyType());
        entity.setMinimumGapMinutes(request.getMinimumGapMinutes());
        entity.setDescription(request.getDescription());

        if (request.getActive() != null) {
            entity.setActive(request.getActive());
        }
    }
}