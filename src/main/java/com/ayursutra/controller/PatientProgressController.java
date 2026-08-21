package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.request.PatientProgressRequest;
import com.ayursutra.dto.response.PatientProgressResponse;
import com.ayursutra.service.AuditService;
import com.ayursutra.service.PatientProgressService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient-progress")
@RequiredArgsConstructor
public class PatientProgressController {

    private final PatientProgressService patientProgressService;

    private final AuditService auditService;


    // =========================
    // CREATE
    // =========================

    @PostMapping
    public ApiResponse<PatientProgressResponse>
    createProgress(
            @Valid @RequestBody PatientProgressRequest request) {

        PatientProgressResponse progress =
                patientProgressService.createProgress(request);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.CREATE);
        audit.setEntityType("PATIENT_PROGRESS");
        audit.setEntityId(progress.getId());
        audit.setDescription(
                "Patient progress assessment created"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Patient progress assessment created successfully",
                progress
        );
    }


    // =========================
    // GET ALL
    // =========================

    @GetMapping
    public ApiResponse<List<PatientProgressResponse>>
    getAllProgress() {

        return new ApiResponse<>(
                true,
                "Patient progress assessments fetched successfully",
                patientProgressService.getAllProgress()
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    public ApiResponse<PatientProgressResponse>
    getProgressById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Patient progress assessment fetched successfully",
                patientProgressService.getProgressById(id)
        );
    }


    // =========================
    // GET BY PATIENT
    // =========================

    @GetMapping("/patient/{patientId}")
    public ApiResponse<List<PatientProgressResponse>>
    getProgressByPatient(
            @PathVariable String patientId) {

        return new ApiResponse<>(
                true,
                "Patient progress assessments fetched successfully",
                patientProgressService
                        .getProgressByPatient(patientId)
        );
    }


    // =========================
    // GET BY THERAPY PLAN
    // =========================

    @GetMapping("/therapy-plan/{therapyPlanId}")
    public ApiResponse<List<PatientProgressResponse>>
    getProgressByTherapyPlan(
            @PathVariable String therapyPlanId) {

        return new ApiResponse<>(
                true,
                "Therapy plan progress assessments fetched successfully",
                patientProgressService
                        .getProgressByTherapyPlan(
                                therapyPlanId
                        )
        );
    }


    // =========================
    // GET BY PATIENT + PLAN
    // =========================

    @GetMapping(
            "/patient/{patientId}/therapy-plan/{therapyPlanId}"
    )
    public ApiResponse<List<PatientProgressResponse>>
    getProgressByPatientAndTherapyPlan(
            @PathVariable String patientId,
            @PathVariable String therapyPlanId) {

        return new ApiResponse<>(
                true,
                "Patient therapy plan progress assessments fetched successfully",
                patientProgressService
                        .getProgressByPatientAndTherapyPlan(
                                patientId,
                                therapyPlanId
                        )
        );
    }


    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ApiResponse<PatientProgressResponse>
    updateProgress(
            @PathVariable String id,
            @Valid @RequestBody PatientProgressRequest request) {

        PatientProgressResponse progress =
                patientProgressService.updateProgress(
                        id,
                        request
                );

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.UPDATE);
        audit.setEntityType("PATIENT_PROGRESS");
        audit.setEntityId(progress.getId());
        audit.setDescription(
                "Patient progress assessment updated"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Patient progress assessment updated successfully",
                progress
        );
    }


    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ApiResponse<String>
    deleteProgress(
            @PathVariable String id) {

        patientProgressService.deleteProgress(id);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.DELETE);
        audit.setEntityType("PATIENT_PROGRESS");
        audit.setEntityId(id);
        audit.setDescription(
                "Patient progress assessment deleted"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Patient progress assessment deleted successfully",
                null
        );
    }
}