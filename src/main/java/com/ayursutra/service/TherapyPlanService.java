package com.ayursutra.service;

import com.ayursutra.dto.request.TherapyPlanRequest;
import com.ayursutra.dto.response.TherapyPlanResponse;

import java.util.List;

public interface TherapyPlanService {

    TherapyPlanResponse createPlan(
            TherapyPlanRequest request);

    List<TherapyPlanResponse> getAllPlans();

    TherapyPlanResponse getPlanById(String id);

    TherapyPlanResponse updatePlan(
            String id,
            TherapyPlanRequest request);

    void deletePlan(String id);
}