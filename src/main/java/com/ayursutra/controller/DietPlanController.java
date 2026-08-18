package com.ayursutra.controller;

import com.ayursutra.dto.request.DietPlanRequest;
import com.ayursutra.dto.response.DietPlanResponse;
import com.ayursutra.service.DietPlanService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diet-plans")
@RequiredArgsConstructor
public class DietPlanController {

    private final DietPlanService dietPlanService;


    @PostMapping
    public ApiResponse<DietPlanResponse> createPlan(
            @Valid @RequestBody DietPlanRequest request) {

        return new ApiResponse<>(
                true,
                "Diet plan created successfully",
                dietPlanService.createPlan(request)
        );
    }


    @GetMapping
    public ApiResponse<List<DietPlanResponse>>
    getAllPlans() {

        return new ApiResponse<>(
                true,
                "Diet plans fetched successfully",
                dietPlanService.getAllPlans()
        );
    }


    @GetMapping("/{id}")
    public ApiResponse<DietPlanResponse>
    getPlanById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Diet plan fetched successfully",
                dietPlanService.getPlanById(id)
        );
    }


    @GetMapping("/patient/{patientId}")
    public ApiResponse<List<DietPlanResponse>>
    getPlansByPatient(
            @PathVariable String patientId) {

        return new ApiResponse<>(
                true,
                "Patient diet plans fetched successfully",
                dietPlanService.getPlansByPatient(
                        patientId
                )
        );
    }


    @GetMapping("/therapy-plan/{therapyPlanId}")
    public ApiResponse<List<DietPlanResponse>>
    getPlansByTherapyPlan(
            @PathVariable String therapyPlanId) {

        return new ApiResponse<>(
                true,
                "Therapy plan diet plans fetched successfully",
                dietPlanService.getPlansByTherapyPlan(
                        therapyPlanId
                )
        );
    }


    @GetMapping("/doctor/{doctorId}")
    public ApiResponse<List<DietPlanResponse>>
    getPlansByDoctor(
            @PathVariable String doctorId) {

        return new ApiResponse<>(
                true,
                "Doctor diet plans fetched successfully",
                dietPlanService.getPlansByDoctor(
                        doctorId
                )
        );
    }


    @PutMapping("/{id}")
    public ApiResponse<DietPlanResponse>
    updatePlan(
            @PathVariable String id,
            @Valid @RequestBody DietPlanRequest request) {

        return new ApiResponse<>(
                true,
                "Diet plan updated successfully",
                dietPlanService.updatePlan(
                        id,
                        request
                )
        );
    }


    @DeleteMapping("/{id}")
    public ApiResponse<String> deletePlan(
            @PathVariable String id) {

        dietPlanService.deletePlan(id);

        return new ApiResponse<>(
                true,
                "Diet plan deleted successfully",
                null
        );
    }
}