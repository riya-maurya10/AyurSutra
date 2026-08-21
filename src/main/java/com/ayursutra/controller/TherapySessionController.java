package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.request.TherapySessionRequest;
import com.ayursutra.dto.response.TherapySessionResponse;
import com.ayursutra.service.AuditService;
import com.ayursutra.service.TherapySessionService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/therapy-sessions")
@RequiredArgsConstructor
public class TherapySessionController {

    private final TherapySessionService therapySessionService;

    private final AuditService auditService;


    // =========================
    // CREATE SESSION
    // =========================

    @PostMapping
    public ApiResponse<TherapySessionResponse> createSession(
            @Valid @RequestBody TherapySessionRequest request) {

        TherapySessionResponse session =
                therapySessionService.createSession(request);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.CREATE);
        audit.setEntityType("THERAPY_SESSION");
        audit.setEntityId(session.getId());
        audit.setDescription(
                "Therapy session created"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Therapy session created successfully",
                session
        );
    }


    // =========================
    // GET ALL
    // =========================

    @GetMapping
    public ApiResponse<List<TherapySessionResponse>>
    getAllSessions() {

        return new ApiResponse<>(
                true,
                "Therapy sessions fetched successfully",
                therapySessionService.getAllSessions()
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    public ApiResponse<TherapySessionResponse>
    getSessionById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Therapy session fetched successfully",
                therapySessionService.getSessionById(id)
        );
    }


    // =========================
    // GET BY PATIENT
    // =========================

    @GetMapping("/patient/{patientId}")
    public ApiResponse<List<TherapySessionResponse>>
    getSessionsByPatient(
            @PathVariable String patientId) {

        return new ApiResponse<>(
                true,
                "Patient therapy sessions fetched successfully",
                therapySessionService
                        .getSessionsByPatient(patientId)
        );
    }


    // =========================
    // GET BY PLAN
    // =========================

    @GetMapping("/plan/{therapyPlanId}")
    public ApiResponse<List<TherapySessionResponse>>
    getSessionsByTherapyPlan(
            @PathVariable String therapyPlanId) {

        return new ApiResponse<>(
                true,
                "Therapy plan sessions fetched successfully",
                therapySessionService
                        .getSessionsByTherapyPlan(therapyPlanId)
        );
    }


    // =========================
    // GET BY THERAPIST
    // =========================

    @GetMapping("/therapist/{therapistId}")
    public ApiResponse<List<TherapySessionResponse>>
    getSessionsByTherapist(
            @PathVariable String therapistId) {

        return new ApiResponse<>(
                true,
                "Therapist sessions fetched successfully",
                therapySessionService
                        .getSessionsByTherapist(therapistId)
        );
    }


    // =========================
    // GET BY DATE
    // =========================

    @GetMapping("/date/{date}")
    public ApiResponse<List<TherapySessionResponse>>
    getSessionsByDate(
            @PathVariable String date) {

        return new ApiResponse<>(
                true,
                "Sessions for date fetched successfully",
                therapySessionService.getSessionsByDate(date)
        );
    }


    // =========================
    // GET BY PLAN + DAY
    // =========================

    @GetMapping("/plan/{therapyPlanId}/day/{dayNumber}")
    public ApiResponse<List<TherapySessionResponse>>
    getSessionsByPlanAndDay(
            @PathVariable String therapyPlanId,
            @PathVariable Integer dayNumber) {

        return new ApiResponse<>(
                true,
                "Therapy plan day sessions fetched successfully",
                therapySessionService
                        .getSessionsByPlanAndDay(
                                therapyPlanId,
                                dayNumber
                        )
        );
    }


    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ApiResponse<TherapySessionResponse>
    updateSession(
            @PathVariable String id,
            @Valid @RequestBody TherapySessionRequest request) {

        TherapySessionResponse session =
                therapySessionService.updateSession(
                        id,
                        request
                );

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.UPDATE);
        audit.setEntityType("THERAPY_SESSION");
        audit.setEntityId(session.getId());
        audit.setDescription(
                "Therapy session updated"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Therapy session updated successfully",
                session
        );
    }


    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteSession(
            @PathVariable String id) {

        therapySessionService.deleteSession(id);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.DELETE);
        audit.setEntityType("THERAPY_SESSION");
        audit.setEntityId(id);
        audit.setDescription(
                "Therapy session deleted"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Therapy session deleted successfully",
                null
        );
    }
}