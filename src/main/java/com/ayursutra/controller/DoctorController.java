package com.ayursutra.controller;

import com.ayursutra.dto.request.DoctorRequest;
import com.ayursutra.dto.response.DoctorResponse;
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

    @PostMapping
    public ApiResponse<DoctorResponse> createDoctor(
            @Valid @RequestBody DoctorRequest request) {

        return new ApiResponse<>(
                true,
                "Doctor created successfully",
                doctorService.createDoctor(request)
        );
    }

    @GetMapping
    public ApiResponse<List<DoctorResponse>> getAllDoctors() {

        return new ApiResponse<>(
                true,
                "Doctors fetched successfully",
                doctorService.getAllDoctors()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<DoctorResponse> getDoctorById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Doctor fetched successfully",
                doctorService.getDoctorById(id)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<DoctorResponse> updateDoctor(
            @PathVariable String id,
            @Valid @RequestBody DoctorRequest request) {

        return new ApiResponse<>(
                true,
                "Doctor updated successfully",
                doctorService.updateDoctor(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteDoctor(
            @PathVariable String id) {

        doctorService.deleteDoctor(id);

        return new ApiResponse<>(
                true,
                "Doctor deleted successfully",
                null
        );
    }
}