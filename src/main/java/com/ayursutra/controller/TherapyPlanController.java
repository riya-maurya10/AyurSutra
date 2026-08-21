package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.request.TherapyPlanRequest;
import com.ayursutra.dto.response.TherapyPlanResponse;
import com.ayursutra.service.AuditService;
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

    private final AuditService auditService;


    // =========================
    // CREATE THERAPY PLAN
    // =========================

    @PostMapping
    public ApiResponse<TherapyPlanResponse> createPlan(
            @Valid @RequestBody TherapyPlanRequest request) {

        TherapyPlanResponse plan =
                therapyPlanService.createPlan(request);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.CREATE);
        audit.setEntityType("THERAPY_PLAN");
        audit.setEntityId(plan.getId());
        audit.setDescription(
                "Therapy plan created"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Therapy plan created successfully",
                plan
        );
    }


    // =========================
    // GET ALL THERAPY PLANS
    // =========================

    @GetMapping
    public ApiResponse<List<TherapyPlanResponse>>
    getAllPlans() {

        return new ApiResponse<>(
                true,
                "Therapy plans fetched successfully",
                therapyPlanService.getAllPlans()
        );
    }


    // =========================
    // GET THERAPY PLAN BY ID
    // =========================

    @GetMapping("/{id}")
    public ApiResponse<TherapyPlanResponse> getPlanById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Therapy plan fetched successfully",
                therapyPlanService.getPlanById(id)
        );
    }


    // =========================
    // UPDATE THERAPY PLAN
    // =========================

    @PutMapping("/{id}")
    public ApiResponse<TherapyPlanResponse> updatePlan(
            @PathVariable String id,
            @Valid @RequestBody TherapyPlanRequest request) {

        TherapyPlanResponse plan =
                therapyPlanService.updatePlan(
                        id,
                        request
                );

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.UPDATE);
        audit.setEntityType("THERAPY_PLAN");
        audit.setEntityId(plan.getId());
        audit.setDescription(
                "Therapy plan updated"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Therapy plan updated successfully",
                plan
        );
    }


    // =========================
    // DELETE THERAPY PLAN
    // =========================

    @DeleteMapping("/{id}")
    public ApiResponse<String> deletePlan(
            @PathVariable String id) {

        therapyPlanService.deletePlan(id);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.DELETE);
        audit.setEntityType("THERAPY_PLAN");
        audit.setEntityId(id);
        audit.setDescription(
                "Therapy plan deleted"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Therapy plan deleted successfully",
                null
        );
    }
}