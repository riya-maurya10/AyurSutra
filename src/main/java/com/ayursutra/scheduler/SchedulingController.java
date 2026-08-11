package com.ayursutra.scheduler;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scheduler")
@RequiredArgsConstructor
public class SchedulingController {

    private final SchedulingService schedulingService;


    @PostMapping("/schedule")
    public ResponseEntity<SchedulingResponse> scheduleTherapy(
            @Valid @RequestBody SchedulingRequest request) {

        return ResponseEntity.ok(
                schedulingService.scheduleTherapy(request)
        );
    }
}