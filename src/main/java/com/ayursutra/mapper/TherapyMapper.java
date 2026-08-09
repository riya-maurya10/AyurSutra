package com.ayursutra.mapper;

import com.ayursutra.dto.request.TherapyRequest;
import com.ayursutra.dto.response.TherapyResponse;
import com.ayursutra.entity.Therapy;
import org.springframework.stereotype.Component;

@Component
public class TherapyMapper {

    public Therapy toEntity(TherapyRequest request) {

        return Therapy.builder()
                .name(request.getName())
                .stage(request.getStage())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .active(request.getActive() != null
                        ? request.getActive()
                        : true)
                .build();
    }

    public TherapyResponse toResponse(Therapy therapy) {

        return TherapyResponse.builder()
                .id(therapy.getId())
                .name(therapy.getName())
                .stage(therapy.getStage())
                .description(therapy.getDescription())
                .durationMinutes(therapy.getDurationMinutes())
                .active(therapy.getActive())
                .build();
    }
}