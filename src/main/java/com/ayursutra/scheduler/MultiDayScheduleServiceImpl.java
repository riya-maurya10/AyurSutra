package com.ayursutra.scheduler;

import com.ayursutra.dto.response.MultiDayScheduleResponse;
import com.ayursutra.dto.response.TherapySessionResponse;
import com.ayursutra.entity.TherapyPlan;
import com.ayursutra.entity.TherapyPlanItem;
import com.ayursutra.repository.TherapyPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MultiDayScheduleServiceImpl
        implements MultiDayScheduleService {

    private final TherapyPlanRepository therapyPlanRepository;

    private final SchedulingService schedulingService;


    @Override
    public MultiDayScheduleResponse generateSchedule(
            String therapyPlanId) {

        // -------------------------------------------------
        // 1. Find Therapy Plan
        // -------------------------------------------------

        TherapyPlan plan =
                therapyPlanRepository.findById(therapyPlanId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy plan not found with ID: "
                                                + therapyPlanId
                                )
                        );


        // -------------------------------------------------
        // 2. Validate Plan Dates
        // -------------------------------------------------

        if (plan.getStartDate() == null ||
                plan.getEndDate() == null) {

            throw new RuntimeException(
                    "Therapy plan must have start date and end date"
            );
        }

        if (plan.getEndDate()
                .isBefore(plan.getStartDate())) {

            throw new RuntimeException(
                    "Therapy plan end date cannot be before start date"
            );
        }


        // -------------------------------------------------
        // 3. Validate Therapies
        // -------------------------------------------------

        if (plan.getTherapies() == null ||
                plan.getTherapies().isEmpty()) {

            throw new RuntimeException(
                    "Therapy plan does not contain any therapies"
            );
        }


        // -------------------------------------------------
        // 4. Sort therapies
        //
        // First by Day
        // Then by Sequence Order
        // -------------------------------------------------

        List<TherapyPlanItem> therapies =
                new ArrayList<>(plan.getTherapies());

        therapies.sort(
                Comparator
                        .comparing(
                                TherapyPlanItem::getDay,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
                        .thenComparing(
                                TherapyPlanItem::getSequenceOrder,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
        );


        // -------------------------------------------------
        // 5. Store generated sessions
        // -------------------------------------------------

        List<TherapySessionResponse> createdSessions =
                new ArrayList<>();


        // -------------------------------------------------
        // 6. Generate schedule for every therapy
        // -------------------------------------------------

        for (TherapyPlanItem item : therapies) {

            // -------------------------------------------------
            // Validate Day
            // -------------------------------------------------

            if (item.getDay() == null ||
                    item.getDay() <= 0) {

                throw new RuntimeException(
                        "Invalid therapy day for therapy: "
                                + item.getTherapyName()
                );
            }


            // -------------------------------------------------
            // Validate Therapy ID
            // -------------------------------------------------

            if (item.getTherapyId() == null ||
                    item.getTherapyId().isBlank()) {

                throw new RuntimeException(
                        "Therapy ID is required for: "
                                + item.getTherapyName()
                );
            }


            // -------------------------------------------------
            // Calculate Session Date
            //
            // Day 1 = Start Date
            // Day 2 = Start Date + 1
            // Day 3 = Start Date + 2
            // -------------------------------------------------

            LocalDate sessionDate =
                    plan.getStartDate()
                            .plusDays(item.getDay() - 1L);


            // -------------------------------------------------
            // Make sure date is inside plan
            // -------------------------------------------------

            if (sessionDate.isAfter(
                    plan.getEndDate())) {

                throw new RuntimeException(
                        "Therapy day "
                                + item.getDay()
                                + " falls outside therapy plan dates"
                );
            }


            // -------------------------------------------------
            // Default starting time
            //
            // Existing Scheduling Engine will handle:
            // - Therapist allocation
            // - Room allocation
            // - Conflict detection
            // -------------------------------------------------

            LocalTime startTime =
                    LocalTime.of(9, 0);


            // -------------------------------------------------
            // Create Scheduling Request
            // -------------------------------------------------

            SchedulingRequest request =
                    new SchedulingRequest();

            request.setTherapyPlanId(
                    therapyPlanId
            );

            request.setTherapyId(
                    item.getTherapyId()
            );

            request.setSessionDate(
                    sessionDate
            );

            request.setStartTime(
                    startTime
            );

            request.setNotes(
                    "MULTI-DAY SCHEDULE - DAY "
                            + item.getDay()
                            + " - "
                            + item.getTherapyName()
            );


            // -------------------------------------------------
            // Call Existing Scheduling Engine
            // -------------------------------------------------

            SchedulingResponse response =
                    schedulingService.scheduleTherapy(
                            request
                    );


            // -------------------------------------------------
            // Validate Scheduler Response
            // -------------------------------------------------

            if (response == null ||
                    !response.isSuccess()) {

                String message =
                        response != null
                                ? response.getMessage()
                                : "Unknown scheduling error";

                throw new RuntimeException(
                        "Failed to schedule "
                                + item.getTherapyName()
                                + " on day "
                                + item.getDay()
                                + ": "
                                + message
                );
            }


            // -------------------------------------------------
            // Add generated session
            // -------------------------------------------------

            if (response.getSession() != null) {

                createdSessions.add(
                        response.getSession()
                );
            }
        }


        // -------------------------------------------------
        // 7. Return Final Response
        // -------------------------------------------------

        return new MultiDayScheduleResponse(
                true,
                "Multi-day schedule generated successfully",
                therapyPlanId,
                createdSessions.size(),
                createdSessions
        );
    }
}