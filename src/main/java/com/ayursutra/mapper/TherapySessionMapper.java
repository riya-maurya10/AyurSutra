package com.ayursutra.mapper;

import com.ayursutra.constant.TherapySessionStatus;
import com.ayursutra.dto.request.TherapySessionRequest;
import com.ayursutra.dto.response.TherapySessionResponse;
import com.ayursutra.entity.TherapySession;
import org.springframework.stereotype.Component;

@Component
public class TherapySessionMapper {

    public TherapySession toEntity(
            TherapySessionRequest request) {

        TherapySession session = new TherapySession();

        session.setTherapyPlanId(
                request.getTherapyPlanId()
        );

        session.setPatientId(
                request.getPatientId()
        );

        session.setTherapistId(
                request.getTherapistId()
        );

        session.setRoomId(
                request.getRoomId()
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

        session.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : TherapySessionStatus.PLANNED
        );

        session.setNotes(
                request.getNotes()
        );

        return session;
    }


    public TherapySessionResponse toResponse(
            TherapySession session) {

        return new TherapySessionResponse(

                session.getId(),

                session.getTherapyPlanId(),

                session.getPatientId(),

                session.getTherapistId(),

                session.getRoomId(),

                session.getTherapyId(),

                session.getTherapyName(),

                session.getDayNumber(),

                session.getSequenceOrder(),

                session.getSessionDate(),

                session.getStartTime(),

                session.getEndTime(),

                session.getPlannedDurationMinutes(),

                session.getActualDurationMinutes(),

                session.getStatus(),

                session.getNotes()
        );
    }
}