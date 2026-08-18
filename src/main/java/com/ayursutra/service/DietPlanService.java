package com.ayursutra.service;

import com.ayursutra.dto.request.DietPlanRequest;
import com.ayursutra.dto.response.DietPlanResponse;

import java.util.List;

public interface DietPlanService {

    DietPlanResponse createPlan(
            DietPlanRequest request
    );

    List<DietPlanResponse> getAllPlans();

    DietPlanResponse getPlanById(
            String id
    );

    List<DietPlanResponse> getPlansByPatient(
            String patientId
    );

    List<DietPlanResponse> getPlansByTherapyPlan(
            String therapyPlanId
    );

    List<DietPlanResponse> getPlansByDoctor(
            String doctorId
    );

    DietPlanResponse updatePlan(
            String id,
            DietPlanRequest request
    );

    void deletePlan(
            String id
    );
}