package com.ayursutra.scheduler;

import com.ayursutra.dto.request.TherapySessionRequest;
import com.ayursutra.dto.response.TherapySessionResponse;
import com.ayursutra.entity.Therapist;
import com.ayursutra.entity.Therapy;
import com.ayursutra.entity.TherapyPlan;
import com.ayursutra.exception.BadRequestException;
import com.ayursutra.repository.*;
import com.ayursutra.service.TherapySessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.ayursutra.entity.TherapyDependency;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Optional;
import java.time.LocalTime;
import java.util.List;

import com.ayursutra.constant.RoomType;
import com.ayursutra.entity.Room;

@Service
@RequiredArgsConstructor
public class SchedulingServiceImpl
        implements SchedulingService {

    private final TherapyPlanRepository therapyPlanRepository;

    private final TherapyRepository therapyRepository;

    private final TherapistRepository therapistRepository;

    private final RoomRepository roomRepository;

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
                therapy.getName(),
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
        // 8. Validate / Automatically Allocate Therapist
        // -------------------------------------------------

        String therapistId = request.getTherapistId();
        String roomId = request.getRoomId();

        if (therapistId == null || therapistId.isBlank()) {

            // Automatically find an available therapist
            // whose specialization matches the therapy name

            List<Therapist> availableTherapists =
                    therapistRepository
                            .findBySpecializationAndAvailableTrue(
                                    therapy.getName()
                            );

            Therapist selectedTherapist = null;

            for (Therapist therapist : availableTherapists) {

                List<TherapySessionResponse> therapistSessions =
                        therapySessionService
                                .getSessionsByTherapist(
                                        therapist.getId()
                                );

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

                                    // Check time overlap
                                    return session.getStartTime()
                                            .isBefore(endTime)
                                            &&
                                            session.getEndTime()
                                                    .isAfter(
                                                            request.getStartTime()
                                                    );
                                });

                if (!therapistConflict) {
                    selectedTherapist = therapist;
                    break;
                }
            }

            if (selectedTherapist == null) {

                throw new BadRequestException(
                        "No available therapist found for therapy: "
                                + therapy.getName()
                                + " on "
                                + request.getSessionDate()
                                + " at "
                                + request.getStartTime()
                                + ". Please choose another therapist or time."
                );
            }

            therapistId = selectedTherapist.getId();
        }


        // -------------------------------------------------
        // 9. Validate manually selected therapist
        // -------------------------------------------------

        else {

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

                                if (!session.getSessionDate()
                                        .equals(request.getSessionDate())) {
                                    return false;
                                }

                                return session.getStartTime()
                                        .isBefore(endTime)
                                        &&
                                        session.getEndTime()
                                                .isAfter(
                                                        request.getStartTime()
                                                );
                            });

            if (therapistConflict) {

                TherapySessionResponse conflictingSession =
                        therapistSessions.stream()
                                .filter(session -> {

                                    if (session.getSessionDate() == null ||
                                            session.getStartTime() == null ||
                                            session.getEndTime() == null) {

                                        return false;
                                    }

                                    if (!session.getSessionDate()
                                            .equals(request.getSessionDate())) {

                                        return false;
                                    }

                                    return session.getStartTime().isBefore(endTime)
                                            && session.getEndTime()
                                            .isAfter(request.getStartTime());
                                })
                                .findFirst()
                                .orElse(null);

                throw new BadRequestException(
                        conflictingSession != null
                                ? "Therapist scheduling conflict: "
                                + "The selected therapist is already assigned to "
                                + conflictingSession.getTherapyName()
                                + " on "
                                + conflictingSession.getSessionDate()
                                + " from "
                                + conflictingSession.getStartTime()
                                + " to "
                                + conflictingSession.getEndTime()
                                + ". Please choose another therapist or time."
                                : "Therapist scheduling conflict: "
                                + "The selected therapist is already assigned to another session during this time."
                );
            }
        }


        // -------------------------------------------------
        // 10. Automatically Allocate Room
        // -------------------------------------------------

        if (roomId == null || roomId.isBlank()) {

            RoomType requiredRoomType;

            switch (therapy.getName().toLowerCase()) {

                case "abhyanga":
                    requiredRoomType = RoomType.THERAPY_ROOM;
                    break;

                case "swedana":
                    requiredRoomType = RoomType.STEAM_ROOM;
                    break;

                case "shirodhara":
                    requiredRoomType = RoomType.SHIRODHARA_ROOM;
                    break;

                case "vamana":
                case "virechana":
                case "basti":
                case "raktamokshana":
                    requiredRoomType = RoomType.PANCHAKARMA_ROOM;
                    break;

                default:
                    requiredRoomType = RoomType.THERAPY_ROOM;
            }

            List<Room> availableRooms =
                    roomRepository.findByTypeAndActiveTrue(
                            requiredRoomType
                    );

            Room selectedRoom = null;

            for (Room room : availableRooms) {

                if (room.getCapacity() == null ||
                        room.getCapacity() <= 0) {
                    continue;
                }

                List<TherapySessionResponse> roomSessions =
                        therapySessionService
                                .getSessionsByRoom(room.getId());

                long overlappingSessions =
                        roomSessions.stream()
                                .filter(session -> {

                                    if (session.getSessionDate() == null ||
                                            session.getStartTime() == null ||
                                            session.getEndTime() == null) {
                                        return false;
                                    }

                                    if (!session.getSessionDate()
                                            .equals(request.getSessionDate())) {
                                        return false;
                                    }

                                    return session.getStartTime()
                                            .isBefore(endTime)
                                            &&
                                            session.getEndTime()
                                                    .isAfter(
                                                            request.getStartTime()
                                                    );
                                })
                                .count();

                System.out.println(
                        "ROOM CAPACITY CHECK: "
                                + room.getRoomNumber()
                                + " | capacity = "
                                + room.getCapacity()
                                + " | overlapping sessions = "
                                + overlappingSessions
                );

                if (overlappingSessions < room.getCapacity()) {

                    selectedRoom = room;
                    break;
                }
            }

            if (selectedRoom == null) {

                throw new BadRequestException(
                        "No room available for "
                                + therapy.getName()
                                + " on "
                                + request.getSessionDate()
                                + " at "
                                + request.getStartTime()
                                + ". All suitable rooms are occupied or at full capacity."
                );
            }

            roomId = selectedRoom.getId();

            System.out.println(
                    "ROOM AUTOMATICALLY ALLOCATED: "
                            + selectedRoom.getRoomNumber()
                            + " | capacity = "
                            + selectedRoom.getCapacity()
            );
        }


        // -------------------------------------------------
        // 11. Validate Manually Selected Room Capacity
        // -------------------------------------------------

        if (request.getRoomId() != null &&
                !request.getRoomId().isBlank()) {

            Room selectedRoom =
                    roomRepository.findById(request.getRoomId())
                            .orElseThrow(() ->
                                    new BadRequestException(
                                            "Room not found with ID: "
                                                    + request.getRoomId()
                                    )
                            );

            if (selectedRoom.getActive() == null ||
                    !selectedRoom.getActive()) {

                throw new BadRequestException(
                        "Selected room is not active"
                );
            }

            if (selectedRoom.getCapacity() == null ||
                    selectedRoom.getCapacity() <= 0) {

                throw new BadRequestException(
                        "Selected room has invalid capacity"
                );
            }

            List<TherapySessionResponse> roomSessions =
                    therapySessionService
                            .getSessionsByRoom(request.getRoomId());

            long overlappingSessions =
                    roomSessions.stream()
                            .filter(session -> {

                                if (session.getSessionDate() == null ||
                                        session.getStartTime() == null ||
                                        session.getEndTime() == null) {

                                    return false;
                                }

                                // Different date → no conflict
                                if (!session.getSessionDate()
                                        .equals(request.getSessionDate())) {

                                    return false;
                                }

                                // Check time overlap
                                return session.getStartTime()
                                        .isBefore(endTime)
                                        &&
                                        session.getEndTime()
                                                .isAfter(
                                                        request.getStartTime()
                                                );
                            })
                            .count();

            if (overlappingSessions >= selectedRoom.getCapacity()) {

                throw new BadRequestException(
                        "Room "
                                + selectedRoom.getRoomNumber()
                                + " is already at full capacity ("
                                + selectedRoom.getCapacity()
                                + ") on "
                                + request.getSessionDate()
                                + " from "
                                + request.getStartTime()
                                + " to "
                                + endTime
                                + ". Please choose another room or time."
                );
            }
        }


        // -------------------------------------------------
        // 12. Validate Patient Time Overlap
        // -------------------------------------------------

        List<TherapySessionResponse> patientSessions =
                therapySessionService
                        .getSessionsByPatient(
                                therapyPlan.getPatientId()
                        );

        boolean patientTimeConflict =
                patientSessions.stream()
                        .anyMatch(session -> {

                            if (session.getSessionDate() == null ||
                                    session.getStartTime() == null ||
                                    session.getEndTime() == null) {
                                return false;
                            }

                            LocalDateTime existingStart =
                                    LocalDateTime.of(
                                            session.getSessionDate(),
                                            session.getStartTime()
                                    );

                            LocalDateTime existingEnd =
                                    LocalDateTime.of(
                                            session.getSessionDate(),
                                            session.getEndTime()
                                    );

                            // Existing session crosses midnight
                            if (!existingEnd.isAfter(existingStart)) {
                                existingEnd = existingEnd.plusDays(1);
                            }

                            LocalDateTime newStart =
                                    LocalDateTime.of(
                                            request.getSessionDate(),
                                            request.getStartTime()
                                    );

                            LocalDateTime newEnd =
                                    LocalDateTime.of(
                                            request.getSessionDate(),
                                            endTime
                                    );

                            // New session crosses midnight
                            if (!newEnd.isAfter(newStart)) {
                                newEnd = newEnd.plusDays(1);
                            }

                            // Check patient time overlap
                            return existingStart.isBefore(newEnd)
                                    && existingEnd.isAfter(newStart);
                        });

        if (patientTimeConflict) {

            TherapySessionResponse conflictingSession =
                    patientSessions.stream()
                            .filter(session -> {

                                if (session.getSessionDate() == null ||
                                        session.getStartTime() == null ||
                                        session.getEndTime() == null) {

                                    return false;
                                }

                                LocalDateTime existingStart =
                                        LocalDateTime.of(
                                                session.getSessionDate(),
                                                session.getStartTime()
                                        );

                                LocalDateTime existingEnd =
                                        LocalDateTime.of(
                                                session.getSessionDate(),
                                                session.getEndTime()
                                        );

                                if (!existingEnd.isAfter(existingStart)) {
                                    existingEnd = existingEnd.plusDays(1);
                                }

                                LocalDateTime newStart =
                                        LocalDateTime.of(
                                                request.getSessionDate(),
                                                request.getStartTime()
                                        );

                                LocalDateTime newEnd =
                                        LocalDateTime.of(
                                                request.getSessionDate(),
                                                endTime
                                        );

                                if (!newEnd.isAfter(newStart)) {
                                    newEnd = newEnd.plusDays(1);
                                }

                                return existingStart.isBefore(newEnd)
                                        && existingEnd.isAfter(newStart);
                            })
                            .findFirst()
                            .orElse(null);

            String conflictMessage =
                    conflictingSession != null
                            ? "Patient scheduling conflict: "
                            + "The patient already has "
                            + conflictingSession.getTherapyName()
                            + " scheduled on "
                            + conflictingSession.getSessionDate()
                            + " from "
                            + conflictingSession.getStartTime()
                            + " to "
                            + conflictingSession.getEndTime()
                            + ". Please choose a different time."
                            : "Patient scheduling conflict: "
                            + "The patient already has another therapy session during this time.";

            throw new BadRequestException(conflictMessage);
        }


        // -------------------------------------------------
        // 13. Determine Day Number
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
        // 14. Determine Sequence Order
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
        // 15. Build Therapy Session Request
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
                therapistId
        );

        sessionRequest.setRoomId(
                roomId
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
        // 16. Create Session Using Existing Service
        // -------------------------------------------------

        TherapySessionResponse savedSession =
                therapySessionService
                        .createSession(sessionRequest);


        // -------------------------------------------------
        // 17. Return Scheduling Result
        // -------------------------------------------------

        return new SchedulingResponse(
                true,
                "Therapy scheduled successfully",
                savedSession
        );
    }


    private void validateTherapyDependencies(
            String therapyId,
            String therapyName,
            String therapyPlanId,
            java.time.LocalDate sessionDate,
            LocalTime startTime) {

        System.out.println(
                "========== DEPENDENCY VALIDATION CALLED =========="
        );

        System.out.println("therapyId = " + therapyId);
        System.out.println("therapyName = " + therapyName);
        System.out.println("therapyPlanId = " + therapyPlanId);
        System.out.println("sessionDate = " + sessionDate);
        System.out.println("startTime = " + startTime);


        // =================================================
        // 1. Get active dependencies
        // =================================================

        List<TherapyDependency> dependencies =
                therapyDependencyRepository
                        .findByTherapyIdAndActiveTrue(therapyId);

        System.out.println(
                "========== DEPENDENCIES =========="
        );

        System.out.println(
                "Dependency count = "
                        + dependencies.size()
        );

        for (TherapyDependency dependency : dependencies) {

            System.out.println(
                    "TYPE = "
                            + dependency.getDependencyType()
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
                        .getSessionsByTherapyPlan(
                                therapyPlanId
                        );

        System.out.println(
                "========== EXISTING SESSIONS =========="
        );

        System.out.println(
                "Session count = "
                        + existingSessions.size()
        );

        for (TherapySessionResponse session :
                existingSessions) {

            System.out.println(
                    "THERAPY = "
                            + session.getTherapyName()
                            + " | ID = "
                            + session.getTherapyId()
                            + " | DATE = "
                            + session.getSessionDate()
                            + " | START = "
                            + session.getStartTime()
                            + " | END = "
                            + session.getEndTime()
            );
        }


        // =================================================
        // 3. Validate dependencies
        // =================================================

        for (TherapyDependency dependency :
                dependencies) {

            if (dependency.getDependencyType() == null) {
                continue;
            }


            String relatedTherapyId =
                    dependency.getRelatedTherapyId();

            String relatedTherapyName =
                    therapyRepository
                            .findById(relatedTherapyId)
                            .map(Therapy::getName)
                            .orElse(
                                    "the prerequisite therapy"
                            );


            // =================================================
            // BEFORE
            //
            // Example:
            // Swedana BEFORE Vamana
            //
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
                            therapyName
                                    + " requires "
                                    + relatedTherapyName
                                    + " to be scheduled earlier "
                                    + "on the same day."
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
                            therapyName
                                    + " requires "
                                    + relatedTherapyName
                                    + " to be completed "
                                    + "before it can be scheduled."
                    );
                }
            }


            // =================================================
            // MIN_GAP
            //
            // Example:
            // Vamana MIN_GAP Abhyanga = 15 minutes
            //
            // The latest related therapy session must be
            // completed before the current therapy with
            // at least the required gap.
            // =================================================

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
                                                session.getTherapyId()
                                        )
                                )
                                .filter(session ->
                                        session.getSessionDate() != null
                                                && session.getEndTime() != null
                                )
                                .filter(session ->
                                        !session.getSessionDate()
                                                .isAfter(sessionDate)
                                )
                                .max(
                                        Comparator
                                                .comparing(
                                                        TherapySessionResponse::getSessionDate
                                                )
                                                .thenComparing(
                                                        TherapySessionResponse::getEndTime
                                                )
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
                            therapyName
                                    + " must be scheduled at least "
                                    + minimumGap
                                    + " minutes after "
                                    + relatedTherapyName
                                    + " ends."
                    );
                }
            }
        }


        System.out.println(
                "========== DEPENDENCY VALIDATION PASSED =========="
        );
    }
}