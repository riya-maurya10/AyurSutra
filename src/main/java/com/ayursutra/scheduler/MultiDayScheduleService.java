package com.ayursutra.scheduler;

import com.ayursutra.dto.request.MultiDayScheduleRequest;
import com.ayursutra.dto.response.MultiDayScheduleResponse;

public interface MultiDayScheduleService {

    MultiDayScheduleResponse generateSchedule(
            MultiDayScheduleRequest request
    );
}