package com.ayursutra.controller;

import com.ayursutra.dto.request.TherapyPlanRequest;
import com.ayursutra.dto.response.TherapyPlanResponse;
import com.ayursutra.service.TherapyPlanService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/therapy-plans")
@RequiredArgsConstructor
public class TherapyPlanController {

    private final TherapyPlanService therapyPlanService;

    @PostMapping
    public ApiResponse<TherapyPlanResponse> createPlan(
            @Valid @RequestBody TherapyPlanRequest request) {

        return new ApiResponse<>(
                true,
                "Therapy plan created successfully",
                therapyPlanService.createPlan(request)
        );
    }

    @GetMapping
    public ApiResponse<List<TherapyPlanResponse>>
    getAllPlans() {

        return new ApiResponse<>(
                true,
                "Therapy plans fetched successfully",
                therapyPlanService.getAllPlans()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<TherapyPlanResponse> getPlanById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Therapy plan fetched successfully",
                therapyPlanService.getPlanById(id)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<TherapyPlanResponse> updatePlan(
            @PathVariable String id,
            @Valid @RequestBody TherapyPlanRequest request) {

        return new ApiResponse<>(
                true,
                "Therapy plan updated successfully",
                therapyPlanService.updatePlan(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deletePlan(
            @PathVariable String id) {

        therapyPlanService.deletePlan(id);

        return new ApiResponse<>(
                true,
                "Therapy plan deleted successfully",
                null
        );
    }
}