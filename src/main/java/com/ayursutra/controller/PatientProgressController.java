package com.ayursutra.controller;

import com.ayursutra.dto.request.PatientProgressRequest;
import com.ayursutra.dto.response.PatientProgressResponse;
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

    private final PatientProgressService
            patientProgressService;


    @PostMapping
    public ApiResponse<PatientProgressResponse>
    createProgress(
            @Valid
            @RequestBody PatientProgressRequest request) {

        return new ApiResponse<>(
                true,
                "Patient progress assessment created successfully",
                patientProgressService.createProgress(request)
        );
    }


    @GetMapping
    public ApiResponse<List<PatientProgressResponse>>
    getAllProgress() {

        return new ApiResponse<>(
                true,
                "Patient progress assessments fetched successfully",
                patientProgressService.getAllProgress()
        );
    }


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


    @GetMapping("/therapy-plan/{therapyPlanId}")
    public ApiResponse<List<PatientProgressResponse>>
    getProgressByTherapyPlan(
            @PathVariable String therapyPlanId) {

        return new ApiResponse<>(
                true,
                "Therapy plan progress assessments fetched successfully",
                patientProgressService
                        .getProgressByTherapyPlan(therapyPlanId)
        );
    }


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


    @PutMapping("/{id}")
    public ApiResponse<PatientProgressResponse>
    updateProgress(
            @PathVariable String id,
            @Valid
            @RequestBody PatientProgressRequest request) {

        return new ApiResponse<>(
                true,
                "Patient progress assessment updated successfully",
                patientProgressService.updateProgress(
                        id,
                        request
                )
        );
    }


    @DeleteMapping("/{id}")
    public ApiResponse<String>
    deleteProgress(
            @PathVariable String id) {

        patientProgressService.deleteProgress(id);

        return new ApiResponse<>(
                true,
                "Patient progress assessment deleted successfully",
                null
        );
    }
}