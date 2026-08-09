package com.ayursutra.service;

import com.ayursutra.dto.request.TherapySessionRequest;
import com.ayursutra.dto.response.TherapySessionResponse;

import java.util.List;

public interface TherapySessionService {

    TherapySessionResponse createSession(
            TherapySessionRequest request
    );

    List<TherapySessionResponse> getAllSessions();

    TherapySessionResponse getSessionById(
            String id
    );

    List<TherapySessionResponse> getSessionsByPatient(
            String patientId
    );

    List<TherapySessionResponse> getSessionsByTherapyPlan(
            String therapyPlanId
    );

    List<TherapySessionResponse> getSessionsByTherapist(
            String therapistId
    );

    List<TherapySessionResponse> getSessionsByDate(
            String date
    );

    List<TherapySessionResponse> getSessionsByPlanAndDay(
            String therapyPlanId,
            Integer dayNumber
    );

    TherapySessionResponse updateSession(
            String id,
            TherapySessionRequest request
    );

    void deleteSession(
            String id
    );
}