package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.request.TherapistRequest;
import com.ayursutra.dto.response.TherapistResponse;
import com.ayursutra.service.AuditService;
import com.ayursutra.service.TherapistService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/therapists")
@RequiredArgsConstructor
public class TherapistController {

    private final TherapistService therapistService;

    private final AuditService auditService;


    // =========================
    // CREATE
    // =========================

    @PostMapping
    public ApiResponse<TherapistResponse> createTherapist(
            @Valid @RequestBody TherapistRequest request) {

        TherapistResponse therapist =
                therapistService.createTherapist(request);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.CREATE);
        audit.setEntityType("THERAPIST");
        audit.setEntityId(therapist.getId());
        audit.setDescription(
                "Therapist created"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Therapist created successfully",
                therapist
        );
    }


    // =========================
    // GET ALL
    // =========================

    @GetMapping
    public ApiResponse<List<TherapistResponse>>
    getAllTherapists() {

        return new ApiResponse<>(
                true,
                "Therapists fetched successfully",
                therapistService.getAllTherapists()
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    public ApiResponse<TherapistResponse> getTherapistById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Therapist fetched successfully",
                therapistService.getTherapistById(id)
        );
    }


    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ApiResponse<TherapistResponse> updateTherapist(
            @PathVariable String id,
            @Valid @RequestBody TherapistRequest request) {

        TherapistResponse therapist =
                therapistService.updateTherapist(
                        id,
                        request
                );

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.UPDATE);
        audit.setEntityType("THERAPIST");
        audit.setEntityId(therapist.getId());
        audit.setDescription(
                "Therapist updated"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Therapist updated successfully",
                therapist
        );
    }


    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteTherapist(
            @PathVariable String id) {

        therapistService.deleteTherapist(id);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.DELETE);
        audit.setEntityType("THERAPIST");
        audit.setEntityId(id);
        audit.setDescription(
                "Therapist deleted"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Therapist deleted successfully",
                null
        );
    }
}