package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.request.DietPlanRequest;
import com.ayursutra.dto.response.DietPlanResponse;
import com.ayursutra.service.AuditService;
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

    private final AuditService auditService;


    // =========================
    // CREATE
    // =========================

    @PostMapping
    public ApiResponse<DietPlanResponse> createPlan(
            @Valid @RequestBody DietPlanRequest request) {

        DietPlanResponse plan =
                dietPlanService.createPlan(request);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.CREATE);
        audit.setEntityType("DIET_PLAN");
        audit.setEntityId(plan.getId());
        audit.setDescription(
                "Diet plan created"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Diet plan created successfully",
                plan
        );
    }


    // =========================
    // GET ALL
    // =========================

    @GetMapping
    public ApiResponse<List<DietPlanResponse>>
    getAllPlans() {

        return new ApiResponse<>(
                true,
                "Diet plans fetched successfully",
                dietPlanService.getAllPlans()
        );
    }


    // =========================
    // GET BY ID
    // =========================

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


    // =========================
    // GET BY PATIENT
    // =========================

    @GetMapping("/patient/{patientId}")
    public ApiResponse<List<DietPlanResponse>>
    getPlansByPatient(
            @PathVariable String patientId) {

        return new ApiResponse<>(
                true,
                "Patient diet plans fetched successfully",
                dietPlanService.getPlansByPatient(patientId)
        );
    }


    // =========================
    // GET BY THERAPY PLAN
    // =========================

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


    // =========================
    // GET BY DOCTOR
    // =========================

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


    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ApiResponse<DietPlanResponse>
    updatePlan(
            @PathVariable String id,
            @Valid @RequestBody DietPlanRequest request) {

        DietPlanResponse plan =
                dietPlanService.updatePlan(
                        id,
                        request
                );

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.UPDATE);
        audit.setEntityType("DIET_PLAN");
        audit.setEntityId(plan.getId());
        audit.setDescription(
                "Diet plan updated"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Diet plan updated successfully",
                plan
        );
    }


    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ApiResponse<String> deletePlan(
            @PathVariable String id) {

        dietPlanService.deletePlan(id);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.DELETE);
        audit.setEntityType("DIET_PLAN");
        audit.setEntityId(id);
        audit.setDescription(
                "Diet plan deleted"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Diet plan deleted successfully",
                null
        );
    }
}