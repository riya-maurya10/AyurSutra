package com.ayursutra.mapper;

import com.ayursutra.dto.request.TherapyPlanRequest;
import com.ayursutra.dto.response.TherapyPlanResponse;
import com.ayursutra.entity.TherapyPlan;
import org.springframework.stereotype.Component;

@Component
public class TherapyPlanMapper {

    public TherapyPlan toEntity(TherapyPlanRequest request) {

        TherapyPlan plan = new TherapyPlan();

        plan.setPatientId(request.getPatientId());
        plan.setDoctorId(request.getDoctorId());
        plan.setPlanName(request.getPlanName());
        plan.setDiagnosis(request.getDiagnosis());
        plan.setStartDate(request.getStartDate());
        plan.setEndDate(request.getEndDate());
        plan.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : "PLANNED"
        );
        plan.setTherapies(request.getTherapies());

        return plan;
    }

    public TherapyPlanResponse toResponse(
            TherapyPlan plan) {

        return new TherapyPlanResponse(
                plan.getId(),
                plan.getPatientId(),
                plan.getDoctorId(),
                plan.getPlanName(),
                plan.getDiagnosis(),
                plan.getStartDate(),
                plan.getEndDate(),
                plan.getStatus(),
                plan.getTherapies()
        );
    }
}