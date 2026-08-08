package com.ayursutra.controller;

import com.ayursutra.dto.request.TherapistRequest;
import com.ayursutra.dto.response.TherapistResponse;
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

    @PostMapping
    public ApiResponse<TherapistResponse> createTherapist(
            @Valid @RequestBody TherapistRequest request) {

        return new ApiResponse<>(
                true,
                "Therapist created successfully",
                therapistService.createTherapist(request)
        );
    }

    @GetMapping
    public ApiResponse<List<TherapistResponse>>
    getAllTherapists() {

        return new ApiResponse<>(
                true,
                "Therapists fetched successfully",
                therapistService.getAllTherapists()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<TherapistResponse> getTherapistById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Therapist fetched successfully",
                therapistService.getTherapistById(id)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<TherapistResponse> updateTherapist(
            @PathVariable String id,
            @Valid @RequestBody TherapistRequest request) {

        return new ApiResponse<>(
                true,
                "Therapist updated successfully",
                therapistService.updateTherapist(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteTherapist(
            @PathVariable String id) {

        therapistService.deleteTherapist(id);

        return new ApiResponse<>(
                true,
                "Therapist deleted successfully",
                null
        );
    }
}