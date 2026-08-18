package com.ayursutra.scheduler;

import com.ayursutra.dto.response.MultiDayScheduleResponse;

public interface MultiDayScheduleService {

    MultiDayScheduleResponse generateSchedule(
            String therapyPlanId
    );
}