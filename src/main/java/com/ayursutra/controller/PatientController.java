package com.ayursutra.controller;

import com.ayursutra.dto.request.CreatePatientRequest;
import com.ayursutra.dto.request.UpdatePatientRequest;
import com.ayursutra.dto.response.PatientResponse;
import com.ayursutra.service.PatientService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    // =========================
    // CREATE PATIENT
    // =========================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    public ApiResponse<PatientResponse> createPatient(
            @Valid @RequestBody CreatePatientRequest request) {

        return new ApiResponse<>(
                true,
                "Patient created successfully",
                patientService.createPatient(request)
        );
    }

    // =========================
    // GET ALL PATIENTS
    // =========================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    public ApiResponse<List<PatientResponse>> getAllPatients() {

        return new ApiResponse<>(
                true,
                "Patients fetched successfully",
                patientService.getAllPatients()
        );
    }

    // =========================
    // GET MY PROFILE
    // =========================

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<PatientResponse> getMyProfile() {

        return new ApiResponse<>(
                true,
                "Patient profile fetched successfully",
                patientService.getMyProfile()
        );
    }

    // =========================
    // UPDATE MY PROFILE
    // =========================

    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<PatientResponse> updateMyProfile(
            @Valid @RequestBody UpdatePatientRequest request) {

        return new ApiResponse<>(
                true,
                "Patient profile updated successfully",
                patientService.updateMyProfile(request)
        );
    }

    // =========================
    // GET PATIENT BY ID
    // =========================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','PATIENT')")
    public ApiResponse<PatientResponse> getPatientById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Patient fetched successfully",
                patientService.getPatientById(id)
        );
    }

    // =========================
    // UPDATE PATIENT BY ID
    // =========================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ApiResponse<PatientResponse> updatePatient(
            @PathVariable String id,
            @Valid @RequestBody UpdatePatientRequest request) {

        return new ApiResponse<>(
                true,
                "Patient updated successfully",
                patientService.updatePatient(id, request)
        );
    }

    // =========================
    // DELETE PATIENT
    // =========================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deletePatient(
            @PathVariable String id) {

        patientService.deletePatient(id);

        return new ApiResponse<>(
                true,
                "Patient deleted successfully",
                null
        );
    }
}