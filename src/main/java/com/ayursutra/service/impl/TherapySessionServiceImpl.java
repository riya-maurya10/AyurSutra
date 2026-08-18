package com.ayursutra.service.impl;

import com.ayursutra.constant.TherapySessionStatus;
import com.ayursutra.dto.request.TherapySessionRequest;
import com.ayursutra.dto.response.TherapySessionResponse;
import com.ayursutra.entity.TherapySession;
import com.ayursutra.mapper.TherapySessionMapper;
import com.ayursutra.repository.TherapySessionRepository;
import com.ayursutra.service.TherapySessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TherapySessionServiceImpl
        implements TherapySessionService {

    private final TherapySessionRepository
            therapySessionRepository;

    private final TherapySessionMapper
            therapySessionMapper;


    @Override
    public TherapySessionResponse createSession(
            TherapySessionRequest request) {

        validateRequest(request);

        TherapySession session =
                therapySessionMapper.toEntity(request);

        TherapySession savedSession =
                therapySessionRepository.save(session);

        return therapySessionMapper.toResponse(
                savedSession
        );
    }


    @Override
    public List<TherapySessionResponse> getAllSessions() {

        return therapySessionRepository.findAll()
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


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


    @Override
    public List<TherapySessionResponse>
    getSessionsByPatient(String patientId) {

        return therapySessionRepository
                .findByPatientId(patientId)
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


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

    @Override
    public List<TherapySessionResponse> getSessionsByRoom(String roomId) {

        return therapySessionRepository
                .findByRoomId(roomId)
                .stream()
                .map(therapySessionMapper::toResponse)
                .toList();
    }


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

        return therapySessionMapper.toResponse(
                updatedSession
        );
    }


    @Override
    public void deleteSession(String id) {

        if (!therapySessionRepository.existsById(id)) {

            throw new RuntimeException(
                    "Therapy session not found"
            );
        }

        therapySessionRepository.deleteById(id);
    }


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