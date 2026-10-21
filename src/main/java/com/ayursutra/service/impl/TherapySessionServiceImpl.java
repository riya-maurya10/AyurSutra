package com.ayursutra.service.impl;

import com.ayursutra.constant.TherapySessionStatus;
import com.ayursutra.dto.request.TherapySessionRequest;
import com.ayursutra.dto.response.TherapySessionResponse;
import com.ayursutra.entity.TherapyPlan;
import com.ayursutra.entity.TherapySession;
import com.ayursutra.mapper.TherapySessionMapper;
import com.ayursutra.repository.TherapyPlanRepository;
import com.ayursutra.repository.TherapySessionRepository;
import com.ayursutra.service.TherapySessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TherapySessionServiceImpl
        implements TherapySessionService {

    private final TherapySessionRepository
            therapySessionRepository;

    private final TherapySessionMapper
            therapySessionMapper;

    private final TherapyPlanRepository
            therapyPlanRepository;


    // =====================================================
    // CREATE SESSION
    // =====================================================

    @Override
    public TherapySessionResponse createSession(
            TherapySessionRequest request) {

        validateRequest(request);

        TherapySession session =
                therapySessionMapper.toEntity(request);

        TherapySession savedSession =
                therapySessionRepository.save(session);

        /*
         * Recalculate the Therapy Plan status after
         * creating a session.
         */
        updateTherapyPlanStatus(
                savedSession.getTherapyPlanId()
        );

        return therapySessionMapper.toResponse(
                savedSession
        );
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    public List<TherapySessionResponse> getAllSessions() {

        return therapySessionRepository.findAll()
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    public TherapySessionResponse getSessionById(
            String id) {

        TherapySession session =
                therapySessionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy session not found"
                                )
                        );

        return therapySessionMapper.toResponse(
                session
        );
    }


    // =====================================================
    // GET BY PATIENT
    // =====================================================

    @Override
    public List<TherapySessionResponse>
    getSessionsByPatient(String patientId) {

        return therapySessionRepository
                .findByPatientId(patientId)
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


    // =====================================================
    // GET BY THERAPY PLAN
    // =====================================================

    @Override
    public List<TherapySessionResponse>
    getSessionsByTherapyPlan(
            String therapyPlanId) {

        return therapySessionRepository
                .findByTherapyPlanId(therapyPlanId)
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


    // =====================================================
    // GET BY THERAPIST
    // =====================================================

    @Override
    public List<TherapySessionResponse>
    getSessionsByTherapist(
            String therapistId) {

        return therapySessionRepository
                .findByTherapistId(therapistId)
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


    // =====================================================
    // GET BY ROOM
    // =====================================================

    @Override
    public List<TherapySessionResponse>
    getSessionsByRoom(String roomId) {

        return therapySessionRepository
                .findByRoomId(roomId)
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


    // =====================================================
    // GET BY DATE
    // =====================================================

    @Override
    public List<TherapySessionResponse>
    getSessionsByDate(String date) {

        LocalDate sessionDate;

        try {

            sessionDate =
                    LocalDate.parse(date);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid date format. Use yyyy-MM-dd"
            );
        }

        return therapySessionRepository
                .findBySessionDate(sessionDate)
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


    // =====================================================
    // GET BY PLAN + DAY
    // =====================================================

    @Override
    public List<TherapySessionResponse>
    getSessionsByPlanAndDay(
            String therapyPlanId,
            Integer dayNumber) {

        return therapySessionRepository
                .findByTherapyPlanIdAndDayNumber(
                        therapyPlanId,
                        dayNumber
                )
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


    // =====================================================
    // UPDATE SESSION
    // =====================================================

    @Override
    public TherapySessionResponse updateSession(
            String id,
            TherapySessionRequest request) {

        validateRequest(request);

        TherapySession session =
                therapySessionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy session not found"
                                )
                        );

        /*
         * Keep the old Therapy Plan ID.
         *
         * This matters if an existing session is moved
         * from one Therapy Plan to another.
         */
        String oldTherapyPlanId =
                session.getTherapyPlanId();

        session.setTherapyPlanId(
                request.getTherapyPlanId()
        );

        session.setPatientId(
                request.getPatientId()
        );

        session.setTherapistId(
                request.getTherapistId()
        );

        session.setTherapyId(
                request.getTherapyId()
        );

        session.setTherapyName(
                request.getTherapyName()
        );

        session.setDayNumber(
                request.getDayNumber()
        );

        session.setSequenceOrder(
                request.getSequenceOrder()
        );

        session.setSessionDate(
                request.getSessionDate()
        );

        session.setStartTime(
                request.getStartTime()
        );

        session.setEndTime(
                request.getEndTime()
        );

        session.setPlannedDurationMinutes(
                request.getPlannedDurationMinutes()
        );

        session.setActualDurationMinutes(
                request.getActualDurationMinutes()
        );

        if (request.getStatus() != null) {

            session.setStatus(
                    request.getStatus()
            );
        }

        session.setNotes(
                request.getNotes()
        );

        TherapySession updatedSession =
                therapySessionRepository.save(session);


        /*
         * Recalculate the NEW Therapy Plan status.
         *
         * This is especially important when a session
         * status changes to COMPLETED, IN_PROGRESS,
         * CANCELLED or SKIPPED.
         */
        updateTherapyPlanStatus(
                updatedSession.getTherapyPlanId()
        );


        /*
         * If the session was moved from another plan,
         * recalculate the OLD plan as well.
         */
        if (oldTherapyPlanId != null
                && !oldTherapyPlanId.equals(
                updatedSession.getTherapyPlanId())) {

            updateTherapyPlanStatus(
                    oldTherapyPlanId
            );
        }

        return therapySessionMapper.toResponse(
                updatedSession
        );
    }


    // =====================================================
    // DELETE
    // =====================================================

    @Override
    public void deleteSession(String id) {

        TherapySession session =
                therapySessionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy session not found"
                                )
                        );

        String therapyPlanId =
                session.getTherapyPlanId();

        therapySessionRepository.deleteById(id);

        /*
         * Recalculate the plan after deleting a session.
         *
         * This keeps the plan status synchronized
         * with the remaining sessions.
         */
        if (therapyPlanId != null) {

            updateTherapyPlanStatus(
                    therapyPlanId
            );
        }
    }


    // =====================================================
    // UPDATE THERAPY PLAN STATUS
    // =====================================================

    private void updateTherapyPlanStatus(
            String therapyPlanId) {

        if (therapyPlanId == null ||
                therapyPlanId.isBlank()) {

            return;
        }

        TherapyPlan plan =
                therapyPlanRepository.findById(
                        therapyPlanId
                ).orElse(null);

        if (plan == null) {
            return;
        }


        /*
         * If the Therapy Plan itself has been cancelled,
         * do not automatically change it based on sessions.
         */
        if ("CANCELLED".equalsIgnoreCase(
                plan.getStatus())) {

            return;
        }


        List<TherapySession> sessions =
                therapySessionRepository
                        .findByTherapyPlanId(
                                therapyPlanId
                        );


        /*
         * A plan with no sessions cannot be considered
         * completed.
         */
        if (sessions.isEmpty()) {

            plan.setStatus("PLANNED");

            therapyPlanRepository.save(plan);

            return;
        }


        boolean allCompleted =
                sessions.stream()
                        .allMatch(session ->
                                session.getStatus()
                                        == TherapySessionStatus.COMPLETED
                        );


        /*
         * If every session is completed,
         * the entire Therapy Plan is completed.
         */
        if (allCompleted) {

            plan.setStatus("COMPLETED");

            therapyPlanRepository.save(plan);

            return;
        }


        /*
         * Check whether treatment has started.
         *
         * COMPLETED and IN_PROGRESS both mean that
         * treatment activity has started.
         */
        boolean treatmentStarted =
                sessions.stream()
                        .anyMatch(session ->

                                session.getStatus()
                                        == TherapySessionStatus.IN_PROGRESS

                                        ||

                                        session.getStatus()
                                                == TherapySessionStatus.COMPLETED
                        );


        if (treatmentStarted) {

            plan.setStatus("IN_PROGRESS");

        } else {

            /*
             * PLANNED / SCHEDULED / CANCELLED / SKIPPED
             * without any completed or in-progress session
             * means treatment has not actually started.
             */
            plan.setStatus("PLANNED");
        }


        therapyPlanRepository.save(plan);
    }


    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateRequest(
            TherapySessionRequest request) {

        if (request.getDayNumber() <= 0) {

            throw new RuntimeException(
                    "Day number must be greater than zero"
            );
        }

        if (request.getSequenceOrder() <= 0) {

            throw new RuntimeException(
                    "Sequence order must be greater than zero"
            );
        }

        if (request.getPlannedDurationMinutes() <= 0) {

            throw new RuntimeException(
                    "Planned duration must be greater than zero"
            );
        }


        // Validate start and end time
        if (request.getStartTime() != null &&
                request.getEndTime() != null) {

            if (!request.getEndTime()
                    .isAfter(request.getStartTime())) {

                throw new RuntimeException(
                        "End time must be after start time"
                );
            }
        }


        if (request.getActualDurationMinutes() != null &&
                request.getActualDurationMinutes() < 0) {

            throw new RuntimeException(
                    "Actual duration cannot be negative"
            );
        }
    }
}