package com.ayursutra.controller;

import com.ayursutra.dto.request.TherapyRequest;
import com.ayursutra.dto.response.TherapyResponse;
import com.ayursutra.service.TherapyService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/therapies")
@RequiredArgsConstructor
public class TherapyController {

    private final TherapyService therapyService;

    @PostMapping
    public ApiResponse<TherapyResponse> createTherapy(
            @Valid @RequestBody TherapyRequest request) {

        return new ApiResponse<>(
                true,
                "Therapy created successfully",
                therapyService.createTherapy(request)
        );
    }

    @GetMapping
    public ApiResponse<List<TherapyResponse>>
    getAllTherapies() {

        return new ApiResponse<>(
                true,
                "Therapies fetched successfully",
                therapyService.getAllTherapies()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<TherapyResponse> getTherapyById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Therapy fetched successfully",
                therapyService.getTherapyById(id)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<TherapyResponse> updateTherapy(
            @PathVariable String id,
            @Valid @RequestBody TherapyRequest request) {

        return new ApiResponse<>(
                true,
                "Therapy updated successfully",
                therapyService.updateTherapy(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteTherapy(
            @PathVariable String id) {

        therapyService.deleteTherapy(id);

        return new ApiResponse<>(
                true,
                "Therapy deleted successfully",
                null
        );
    }
}