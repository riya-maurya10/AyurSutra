package com.ayursutra.scheduler;

public interface SchedulingService {

    SchedulingResponse scheduleTherapy(
            SchedulingRequest request
    );
}