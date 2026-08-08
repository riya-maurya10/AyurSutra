package com.ayursutra.controller;

import com.ayursutra.dto.request.CreatePatientRequest;
import com.ayursutra.dto.request.UpdatePatientRequest;
import com.ayursutra.dto.response.PatientResponse;
import com.ayursutra.service.PatientService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ApiResponse<PatientResponse> createPatient(
            @Valid @RequestBody CreatePatientRequest request) {

        return new ApiResponse<>(
                true,
                "Patient created successfully",
                patientService.createPatient(request)
        );
    }

    @GetMapping
    public ApiResponse<List<PatientResponse>> getAllPatients() {

        return new ApiResponse<>(
                true,
                "Patients fetched successfully",
                patientService.getAllPatients()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<PatientResponse> getPatientById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Patient fetched successfully",
                patientService.getPatientById(id)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<PatientResponse> updatePatient(
            @PathVariable String id,
            @RequestBody UpdatePatientRequest request) {

        return new ApiResponse<>(
                true,
                "Patient updated successfully",
                patientService.updatePatient(id, request)
        );
    }

    @DeleteMapping("/{id}")
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