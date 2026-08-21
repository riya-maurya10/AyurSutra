package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.request.DoctorRequest;
import com.ayursutra.dto.response.DoctorResponse;
import com.ayursutra.service.AuditService;
import com.ayursutra.service.DoctorService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    private final AuditService auditService;


    // =========================
    // CREATE
    // =========================

    @PostMapping
    public ApiResponse<DoctorResponse> createDoctor(
            @Valid @RequestBody DoctorRequest request) {

        DoctorResponse doctor =
                doctorService.createDoctor(request);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.CREATE);
        audit.setEntityType("DOCTOR");
        audit.setEntityId(doctor.getId());
        audit.setDescription(
                "Doctor created"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Doctor created successfully",
                doctor
        );
    }


    // =========================
    // GET ALL
    // =========================

    @GetMapping
    public ApiResponse<List<DoctorResponse>> getAllDoctors() {

        return new ApiResponse<>(
                true,
                "Doctors fetched successfully",
                doctorService.getAllDoctors()
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    public ApiResponse<DoctorResponse> getDoctorById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Doctor fetched successfully",
                doctorService.getDoctorById(id)
        );
    }


    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ApiResponse<DoctorResponse> updateDoctor(
            @PathVariable String id,
            @Valid @RequestBody DoctorRequest request) {

        DoctorResponse doctor =
                doctorService.updateDoctor(
                        id,
                        request
                );

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.UPDATE);
        audit.setEntityType("DOCTOR");
        audit.setEntityId(doctor.getId());
        audit.setDescription(
                "Doctor updated"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Doctor updated successfully",
                doctor
        );
    }


    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteDoctor(
            @PathVariable String id) {

        doctorService.deleteDoctor(id);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.DELETE);
        audit.setEntityType("DOCTOR");
        audit.setEntityId(id);
        audit.setDescription(
                "Doctor deleted"
        );

        auditService.createAuditLog(audit);

        return new ApiResponse<>(
                true,
                "Doctor deleted successfully",
                null
        );
    }
}