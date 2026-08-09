package com.ayursutra.controller;

import com.ayursutra.dto.request.TherapySessionRequest;
import com.ayursutra.dto.response.TherapySessionResponse;
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

    private final TherapySessionService
            therapySessionService;


    @PostMapping
    public ApiResponse<TherapySessionResponse>
    createSession(
            @Valid @RequestBody
            TherapySessionRequest request) {

        return new ApiResponse<>(
                true,
                "Therapy session created successfully",
                therapySessionService.createSession(request)
        );
    }


    @GetMapping
    public ApiResponse<List<TherapySessionResponse>>
    getAllSessions() {

        return new ApiResponse<>(
                true,
                "Therapy sessions fetched successfully",
                therapySessionService.getAllSessions()
        );
    }


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


    @GetMapping("/plan/{therapyPlanId}")
    public ApiResponse<List<TherapySessionResponse>>
    getSessionsByTherapyPlan(
            @PathVariable String therapyPlanId) {

        return new ApiResponse<>(
                true,
                "Therapy plan sessions fetched successfully",
                therapySessionService
                        .getSessionsByTherapyPlan(
                                therapyPlanId
                        )
        );
    }


    @GetMapping("/therapist/{therapistId}")
    public ApiResponse<List<TherapySessionResponse>>
    getSessionsByTherapist(
            @PathVariable String therapistId) {

        return new ApiResponse<>(
                true,
                "Therapist sessions fetched successfully",
                therapySessionService
                        .getSessionsByTherapist(
                                therapistId
                        )
        );
    }


    @GetMapping("/date/{date}")
    public ApiResponse<List<TherapySessionResponse>>
    getSessionsByDate(
            @PathVariable String date) {

        return new ApiResponse<>(
                true,
                "Sessions for date fetched successfully",
                therapySessionService
                        .getSessionsByDate(date)
        );
    }


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


    @PutMapping("/{id}")
    public ApiResponse<TherapySessionResponse>
    updateSession(
            @PathVariable String id,
            @Valid @RequestBody
            TherapySessionRequest request) {

        return new ApiResponse<>(
                true,
                "Therapy session updated successfully",
                therapySessionService
                        .updateSession(id, request)
        );
    }


    @DeleteMapping("/{id}")
    public ApiResponse<String>
    deleteSession(
            @PathVariable String id) {

        therapySessionService.deleteSession(id);

        return new ApiResponse<>(
                true,
                "Therapy session deleted successfully",
                null
        );
    }
}