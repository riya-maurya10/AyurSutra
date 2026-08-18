package com.ayursutra.controller;

import com.ayursutra.dto.request.MultiDayScheduleRequest;
import com.ayursutra.dto.response.MultiDayScheduleResponse;
import com.ayursutra.scheduler.MultiDayScheduleService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scheduler")
@RequiredArgsConstructor
public class MultiDayScheduleController {

    private final MultiDayScheduleService
            multiDayScheduleService;

    @PostMapping("/generate-multi-day")
    public ApiResponse<MultiDayScheduleResponse>
    generateMultiDaySchedule(
            @Valid @RequestBody
            MultiDayScheduleRequest request) {

        return new ApiResponse<>(
                true,
                "Multi-day schedule generated successfully",
                multiDayScheduleService.generateSchedule(
                        request.getTherapyPlanId()
                )
        );
    }
}