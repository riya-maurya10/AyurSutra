package com.ayursutra.scheduler;

import com.ayursutra.dto.request.MultiDayScheduleRequest;
import com.ayursutra.dto.response.MultiDayScheduleResponse;
import com.ayursutra.dto.response.TherapySessionResponse;
import com.ayursutra.entity.TherapyPlan;
import com.ayursutra.entity.TherapyPlanItem;
import com.ayursutra.repository.TherapyPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
            MultiDayScheduleRequest request) {

        // -------------------------------------------------
        // 1. Validate Request
        // -------------------------------------------------

        if (request == null) {
            throw new RuntimeException(
                    "Multi-day schedule request is required"
            );
        }

        if (request.getTherapyPlanId() == null ||
                request.getTherapyPlanId().isBlank()) {

            throw new RuntimeException(
                    "Therapy plan ID is required"
            );
        }

        if (request.getSessions() == null ||
                request.getSessions().isEmpty()) {

            throw new RuntimeException(
                    "At least one session is required"
            );
        }


        // -------------------------------------------------
        // 2. Find Therapy Plan
        // -------------------------------------------------

        String therapyPlanId =
                request.getTherapyPlanId();

        TherapyPlan plan =
                therapyPlanRepository.findById(therapyPlanId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy plan not found with ID: "
                                                + therapyPlanId
                                )
                        );


        // -------------------------------------------------
        // 3. Validate Plan Dates
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
        // 4. Validate Plan Therapies
        // -------------------------------------------------

        if (plan.getTherapies() == null ||
                plan.getTherapies().isEmpty()) {

            throw new RuntimeException(
                    "Therapy plan does not contain any therapies"
            );
        }


        // -------------------------------------------------
        // 5. Sort Plan Therapies
        //
        // Used to determine the expected dependency order.
        // -------------------------------------------------

        List<TherapyPlanItem> planTherapies =
                new ArrayList<>(plan.getTherapies());

        planTherapies.sort(
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
        // 6. Store Created Sessions
        // -------------------------------------------------

        List<TherapySessionResponse> createdSessions =
                new ArrayList<>();


        // -------------------------------------------------
        // 7. Process Receptionist Selected Sessions
        // -------------------------------------------------

        for (
                MultiDayScheduleRequest.MultiDaySessionRequest
                        sessionRequest
                : request.getSessions()
        ) {

            // -------------------------------------------------
            // Validate Therapy ID
            // -------------------------------------------------

            if (sessionRequest.getTherapyId() == null ||
                    sessionRequest.getTherapyId().isBlank()) {

                throw new RuntimeException(
                        "Therapy ID is required"
                );
            }


            // -------------------------------------------------
            // Find Therapy Inside Plan
            // -------------------------------------------------

            TherapyPlanItem planItem =
                    planTherapies.stream()
                            .filter(item ->
                                    item.getTherapyId() != null &&
                                            item.getTherapyId()
                                                    .equals(
                                                            sessionRequest
                                                                    .getTherapyId()
                                                    )
                            )
                            .findFirst()
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Therapy "
                                                    + sessionRequest
                                                    .getTherapyId()
                                                    + " does not belong to therapy plan"
                                    )
                            );


            // -------------------------------------------------
            // Validate Date
            // -------------------------------------------------

            LocalDate sessionDate =
                    sessionRequest.getSessionDate();

            if (sessionDate == null) {

                throw new RuntimeException(
                        "Session date is required for therapy: "
                                + planItem.getTherapyName()
                );
            }

            if (sessionDate.isBefore(
                    plan.getStartDate())) {

                throw new RuntimeException(
                        "Session date for "
                                + planItem.getTherapyName()
                                + " cannot be before therapy plan start date"
                );
            }

            if (sessionDate.isAfter(
                    plan.getEndDate())) {

                throw new RuntimeException(
                        "Session date for "
                                + planItem.getTherapyName()
                                + " cannot be after therapy plan end date"
                );
            }


            // -------------------------------------------------
            // Validate Start Time
            // -------------------------------------------------

            if (sessionRequest.getStartTime() == null) {

                throw new RuntimeException(
                        "Start time is required for therapy: "
                                + planItem.getTherapyName()
                );
            }


            // -------------------------------------------------
            // Create Scheduling Request
            //
            // Selected therapist and room are passed through
            // when provided.
            // -------------------------------------------------

            SchedulingRequest schedulingRequest =
                    new SchedulingRequest();

            schedulingRequest.setTherapyPlanId(
                    therapyPlanId
            );

            schedulingRequest.setTherapyId(
                    sessionRequest.getTherapyId()
            );

            schedulingRequest.setSessionDate(
                    sessionDate
            );

            schedulingRequest.setStartTime(
                    sessionRequest.getStartTime()
            );


            if (sessionRequest.getTherapistId() != null &&
                    !sessionRequest.getTherapistId().isBlank()) {

                schedulingRequest.setTherapistId(
                        sessionRequest.getTherapistId()
                );
            }


            if (sessionRequest.getRoomId() != null &&
                    !sessionRequest.getRoomId().isBlank()) {

                schedulingRequest.setRoomId(
                        sessionRequest.getRoomId()
                );
            }


            if (sessionRequest.getNotes() != null &&
                    !sessionRequest.getNotes().isBlank()) {

                schedulingRequest.setNotes(
                        sessionRequest.getNotes()
                );

            } else {

                schedulingRequest.setNotes(
                        "MULTI-DAY SCHEDULE - DAY "
                                + planItem.getDay()
                                + " - "
                                + planItem.getTherapyName()
                );
            }


            // -------------------------------------------------
            // Call Existing Scheduling Engine
            //
            // This preserves existing:
            // - dependency validation
            // - therapist validation
            // - room validation
            // - patient conflict validation
            // - therapy validation
            // -------------------------------------------------

            SchedulingResponse response =
                    schedulingService.scheduleTherapy(
                            schedulingRequest
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
                                + planItem.getTherapyName()
                                + " on "
                                + sessionDate
                                + ": "
                                + message
                );
            }


            // -------------------------------------------------
            // Store Created Session
            // -------------------------------------------------

            if (response.getSession() != null) {

                createdSessions.add(
                        response.getSession()
                );
            }
        }


        // -------------------------------------------------
        // 8. Return Final Response
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