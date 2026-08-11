package com.ayursutra.scheduler;

import com.ayursutra.dto.request.TherapySessionRequest;
import com.ayursutra.dto.response.TherapySessionResponse;
import com.ayursutra.entity.Therapy;
import com.ayursutra.entity.TherapyPlan;
import com.ayursutra.exception.BadRequestException;
import com.ayursutra.repository.TherapyPlanRepository;
import com.ayursutra.repository.TherapyRepository;
import com.ayursutra.service.TherapySessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.ayursutra.entity.TherapyDependency;
import com.ayursutra.repository.TherapyDependencyRepository;
import java.util.Comparator;
import java.util.Optional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchedulingServiceImpl
        implements SchedulingService {

    private final TherapyPlanRepository therapyPlanRepository;

    private final TherapyRepository therapyRepository;

    private final TherapyDependencyRepository therapyDependencyRepository;

    private final TherapySessionService therapySessionService;


    @Override
    public SchedulingResponse scheduleTherapy(
            SchedulingRequest request) {

        // -------------------------------------------------
        // 1. Validate Therapy Plan
        // -------------------------------------------------

        TherapyPlan therapyPlan =
                therapyPlanRepository
                        .findById(request.getTherapyPlanId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy plan not found with ID: "
                                                + request.getTherapyPlanId()
                                )
                        );


        // -------------------------------------------------
        // 2. Validate Session Date
        // -------------------------------------------------

        if (therapyPlan.getStartDate() != null &&
                request.getSessionDate()
                        .isBefore(therapyPlan.getStartDate())) {

            throw new RuntimeException(
                    "Session date cannot be before therapy plan start date"
            );
        }

        if (therapyPlan.getEndDate() != null &&
                request.getSessionDate()
                        .isAfter(therapyPlan.getEndDate())) {

            throw new RuntimeException(
                    "Session date cannot be after therapy plan end date"
            );
        }


        // -------------------------------------------------
        // 3. Validate Therapy
        // -------------------------------------------------

        Therapy therapy =
                therapyRepository
                        .findById(request.getTherapyId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy not found with ID: "
                                                + request.getTherapyId()
                                )
                        );


        // -------------------------------------------------
        // 4. Validate Therapy is Active
        // -------------------------------------------------

        if (therapy.getActive() == null ||
                !therapy.getActive()) {

            throw new RuntimeException(
                    "Therapy is not active"
            );
        }

        // -------------------------------------------------
// 5. Validate Therapy Dependencies
// -------------------------------------------------

        validateTherapyDependencies(
                therapy.getId(),
                therapyPlan.getId(),
                request.getSessionDate(),
                request.getStartTime()
        );


        // -------------------------------------------------
        // 6. Get Therapy Duration
        // -------------------------------------------------

        Integer duration =
                therapy.getDurationMinutes();

        if (duration == null ||
                duration <= 0) {

            throw new RuntimeException(
                    "Therapy duration must be greater than zero"
            );
        }


        // -------------------------------------------------
        // 7. Calculate End Time Automatically
        // -------------------------------------------------

        LocalTime endTime =
                request.getStartTime()
                        .plusMinutes(duration);


        // -------------------------------------------------
// 8. Validate Therapist Availability
// -------------------------------------------------

        String therapistId = request.getTherapistId();

        if (therapistId != null && !therapistId.isBlank()) {

            List<TherapySessionResponse> therapistSessions =
                    therapySessionService
                            .getSessionsByTherapist(therapistId);

            boolean therapistConflict =
                    therapistSessions.stream()
                            .anyMatch(session -> {

                                if (session.getSessionDate() == null ||
                                        session.getStartTime() == null ||
                                        session.getEndTime() == null) {
                                    return false;
                                }

                                // Different day → no conflict
                                if (!session.getSessionDate()
                                        .equals(request.getSessionDate())) {
                                    return false;
                                }

                                // Same therapist + overlapping time
                                return session.getStartTime()
                                        .isBefore(endTime)
                                        &&
                                        session.getEndTime()
                                                .isAfter(request.getStartTime());
                            });

            if (therapistConflict) {
                throw new BadRequestException(
                        "Therapist is already assigned to another session during this time"
                );
            }
        }



        // -------------------------------------------------
// 11. Validate Room Conflict
// -------------------------------------------------

        if (request.getRoomId() != null &&
                !request.getRoomId().isBlank()) {

            List<TherapySessionResponse> roomSessions =
                    therapySessionService
                            .getSessionsByRoom(request.getRoomId());

            boolean roomConflict =
                    roomSessions.stream()
                            .anyMatch(session -> {

                                if (session.getSessionDate() == null ||
                                        session.getStartTime() == null ||
                                        session.getEndTime() == null) {
                                    return false;
                                }

                                // Different day → no conflict
                                if (!session.getSessionDate()
                                        .equals(request.getSessionDate())) {
                                    return false;
                                }

                                // Overlap condition
                                return session.getStartTime()
                                        .isBefore(endTime)
                                        &&
                                        session.getEndTime()
                                                .isAfter(request.getStartTime());
                            });

            if (roomConflict) {
                throw new BadRequestException(
                        "Room is already occupied during this time"
                );
            }
        }


        // -------------------------------------------------
// 8. Validate Time Overlap
// -------------------------------------------------

        List<TherapySessionResponse> allExistingSessions =
                therapySessionService
                        .getSessionsByTherapyPlan(therapyPlan.getId());

        System.out.println("========== EXISTING SESSIONS ==========");

        allExistingSessions.forEach(session -> {
            System.out.println(
                    "Therapy = " + session.getTherapyName()
                            + " | Date = " + session.getSessionDate()
                            + " | Start = " + session.getStartTime()
                            + " | End = " + session.getEndTime()
            );
        });

        System.out.println(
                "NEW SESSION | Date = " + request.getSessionDate()
                        + " | Start = " + request.getStartTime()
                        + " | End = " + endTime
        );

        System.out.println("=======================================");

        boolean timeConflict =
                allExistingSessions.stream()
                        .anyMatch(session -> {

                            if (session.getSessionDate() == null ||
                                    session.getStartTime() == null ||
                                    session.getEndTime() == null) {
                                return false;
                            }

                            // Different day → no conflict
                            if (!session.getSessionDate()
                                    .equals(request.getSessionDate())) {
                                return false;
                            }

                            // Overlap condition:
                            // existingStart < newEnd
                            // AND existingEnd > newStart

                            return session.getStartTime()
                                    .isBefore(endTime)
                                    &&
                                    session.getEndTime()
                                            .isAfter(request.getStartTime());
                        });

        if (timeConflict) {
            throw new BadRequestException(
                    "Therapy session overlaps with an existing session"
            );
        }



        // -------------------------------------------------
        // 9. Determine Day Number
        // -------------------------------------------------

        int dayNumber = 1;

        if (therapyPlan.getStartDate() != null) {

            dayNumber =
                    (int) (
                            java.time.temporal.ChronoUnit
                                    .DAYS
                                    .between(
                                            therapyPlan.getStartDate(),
                                            request.getSessionDate()
                                    )
                    ) + 1;
        }


        // -------------------------------------------------
        // 10. Determine Sequence Order
        // -------------------------------------------------

        List<TherapySessionResponse> existingSessions =
                therapySessionService
                        .getSessionsByPlanAndDay(
                                therapyPlan.getId(),
                                dayNumber
                        );

        int sequenceOrder =
                existingSessions.size() + 1;


        // -------------------------------------------------
        // 11. Build Therapy Session Request
        // -------------------------------------------------

        TherapySessionRequest sessionRequest =
                new TherapySessionRequest();

        sessionRequest.setTherapyPlanId(
                therapyPlan.getId()
        );

        sessionRequest.setPatientId(
                therapyPlan.getPatientId()
        );

        sessionRequest.setTherapistId(
                request.getTherapistId()
        );

        sessionRequest.setRoomId(
                request.getRoomId()
        );

        sessionRequest.setTherapyId(
                therapy.getId()
        );

        sessionRequest.setTherapyName(
                therapy.getName()
        );

        sessionRequest.setDayNumber(
                dayNumber
        );

        sessionRequest.setSequenceOrder(
                sequenceOrder
        );

        sessionRequest.setSessionDate(
                request.getSessionDate()
        );

        sessionRequest.setStartTime(
                request.getStartTime()
        );

        sessionRequest.setEndTime(
                endTime
        );

        sessionRequest.setPlannedDurationMinutes(
                duration
        );

        sessionRequest.setNotes(
                request.getNotes()
        );


        // -------------------------------------------------
        // 12. Create Session Using Existing Service
        // -------------------------------------------------

        TherapySessionResponse savedSession =
                therapySessionService
                        .createSession(sessionRequest);


        // -------------------------------------------------
        // 13. Return Scheduling Result
        // -------------------------------------------------

        return new SchedulingResponse(
                true,
                "Therapy scheduled successfully",
                savedSession
        );
    }

    private void validateTherapyDependencies(
            String therapyId,
            String therapyPlanId,
            java.time.LocalDate sessionDate,
            LocalTime startTime) {

        System.out.println("========== DEPENDENCY VALIDATION CALLED ==========");
        System.out.println("therapyId = " + therapyId);
        System.out.println("therapyPlanId = " + therapyPlanId);
        System.out.println("sessionDate = " + sessionDate);
        System.out.println("startTime = " + startTime);

        // =================================================
        // 1. Get active dependencies
        // =================================================

        List<TherapyDependency> dependencies =
                therapyDependencyRepository
                        .findByTherapyIdAndActiveTrue(therapyId);

        System.out.println("========== DEPENDENCIES ==========");
        System.out.println("Dependency count = " + dependencies.size());

        for (TherapyDependency dependency : dependencies) {

            System.out.println(
                    "TYPE = " + dependency.getDependencyType()
                            + " | RELATED THERAPY ID = "
                            + dependency.getRelatedTherapyId()
                            + " | DESCRIPTION = "
                            + dependency.getDescription()
            );
        }

        // =================================================
        // 2. Get existing sessions
        // =================================================

        List<TherapySessionResponse> existingSessions =
                therapySessionService
                        .getSessionsByTherapyPlan(therapyPlanId);

        System.out.println("========== EXISTING SESSIONS ==========");
        System.out.println("Session count = " + existingSessions.size());

        for (TherapySessionResponse session : existingSessions) {

            System.out.println(
                    "THERAPY = " + session.getTherapyName()
                            + " | ID = " + session.getTherapyId()
                            + " | DATE = " + session.getSessionDate()
                            + " | START = " + session.getStartTime()
                            + " | END = " + session.getEndTime()
            );
        }

        // =================================================
        // 3. Validate dependencies
        // =================================================

        for (TherapyDependency dependency : dependencies) {

            if (dependency.getDependencyType() == null) {
                continue;
            }

            String relatedTherapyId =
                    dependency.getRelatedTherapyId();

            // =================================================
            // BEFORE
            //
            // Example:
            // Swedana BEFORE Vamana
            //
            // IMPORTANT:
            // Required therapy MUST be on the SAME DAY
            // and MUST start before the current therapy.
            // =================================================

            if (dependency.getDependencyType()
                    == TherapyDependency.DependencyType.BEFORE) {

                boolean relatedTherapyFoundBefore =
                        existingSessions.stream()
                                .anyMatch(session -> {

                                    // Wrong therapy
                                    if (!relatedTherapyId.equals(
                                            session.getTherapyId())) {

                                        return false;
                                    }

                                    // Missing date/time
                                    if (session.getSessionDate() == null
                                            || session.getStartTime() == null) {

                                        return false;
                                    }

                                    // MUST be the same day
                                    if (!session.getSessionDate()
                                            .equals(sessionDate)) {

                                        return false;
                                    }

                                    // Required therapy must start earlier
                                    return session.getStartTime()
                                            .isBefore(startTime);
                                });

                System.out.println(
                        "BEFORE dependency satisfied = "
                                + relatedTherapyFoundBefore
                );

                if (!relatedTherapyFoundBefore) {

                    throw new BadRequestException(
                            "Therapy requires prerequisite therapy "
                                    + relatedTherapyId
                                    + " to be scheduled earlier on the same day"
                    );
                }
            }

            // =================================================
            // REQUIRES
            //
            // Example:
            // Vamana REQUIRES Abhyanga
            //
            // Abhyanga can be on an earlier day OR
            // earlier on the same day.
            // =================================================

            if (dependency.getDependencyType()
                    == TherapyDependency.DependencyType.REQUIRES) {

                boolean requiredTherapyFound =
                        existingSessions.stream()
                                .anyMatch(session -> {

                                    // Wrong therapy
                                    if (!relatedTherapyId.equals(
                                            session.getTherapyId())) {

                                        return false;
                                    }

                                    // Missing date/time
                                    if (session.getSessionDate() == null
                                            || session.getStartTime() == null) {

                                        return false;
                                    }

                                    // Earlier date = valid
                                    if (session.getSessionDate()
                                            .isBefore(sessionDate)) {

                                        return true;
                                    }

                                    // Later date = invalid
                                    if (session.getSessionDate()
                                            .isAfter(sessionDate)) {

                                        return false;
                                    }

                                    // Same day:
                                    // required therapy must start earlier
                                    return session.getStartTime()
                                            .isBefore(startTime);
                                });

                System.out.println(
                        "REQUIRES dependency satisfied = "
                                + requiredTherapyFound
                );

                if (!requiredTherapyFound) {

                    throw new BadRequestException(
                            "Therapy requires prerequisite therapy "
                                    + relatedTherapyId
                                    + " to be scheduled before it"
                    );
                }
            }

// MIN_GAP
//
// Example:
// Vamana MIN_GAP Abhyanga = 15 minutes
//
// The latest related therapy session must be completed
// before the current therapy with at least the required gap.

            if (dependency.getDependencyType()
                    == TherapyDependency.DependencyType.MIN_GAP) {

                int minimumGap =
                        dependency.getMinimumGapMinutes() != null
                                ? dependency.getMinimumGapMinutes()
                                : 0;

                // Find the latest related therapy session
                Optional<TherapySessionResponse> latestRelatedSession =
                        existingSessions.stream()
                                .filter(session ->
                                        relatedTherapyId.equals(
                                                session.getTherapyId()))
                                .filter(session ->
                                        session.getSessionDate() != null
                                                && session.getEndTime() != null)
                                .filter(session ->
                                        !session.getSessionDate()
                                                .isAfter(sessionDate))
                                .max(
                                        Comparator
                                                .comparing(
                                                        TherapySessionResponse::getSessionDate)
                                                .thenComparing(
                                                        TherapySessionResponse::getEndTime)
                                );

                boolean minimumGapSatisfied = false;

                if (latestRelatedSession.isPresent()) {

                    TherapySessionResponse prerequisite =
                            latestRelatedSession.get();

                    // Earlier day → gap automatically satisfied
                    if (prerequisite.getSessionDate()
                            .isBefore(sessionDate)) {

                        minimumGapSatisfied = true;

                    } else {

                        // Same day
                        LocalTime earliestAllowedStart =
                                prerequisite.getEndTime()
                                        .plusMinutes(minimumGap);

                        minimumGapSatisfied =
                                !earliestAllowedStart.isAfter(startTime);
                    }

                    System.out.println(
                            "MIN_GAP CHECK"
                                    + " | prerequisite = "
                                    + prerequisite.getTherapyName()
                                    + " | date = "
                                    + prerequisite.getSessionDate()
                                    + " | end = "
                                    + prerequisite.getEndTime()
                                    + " | requested start = "
                                    + startTime
                                    + " | required gap = "
                                    + minimumGap
                                    + " minutes"
                    );

                } else {

                    System.out.println(
                            "MIN_GAP CHECK"
                                    + " | No previous related therapy session found"
                    );
                }

                System.out.println(
                        "MIN_GAP dependency satisfied = "
                                + minimumGapSatisfied
                                + " | required gap = "
                                + minimumGap
                                + " minutes"
                );

                if (!minimumGapSatisfied) {

                    throw new BadRequestException(
                            "Therapy requires at least "
                                    + minimumGap
                                    + " minutes gap after prerequisite therapy "
                                    + relatedTherapyId
                    );
                }
            }
        }

        System.out.println(
                "========== DEPENDENCY VALIDATION PASSED =========="
        );
    }
}