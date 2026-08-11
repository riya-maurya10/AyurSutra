package com.ayursutra.repository;

import com.ayursutra.entity.TherapySession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface TherapySessionRepository
        extends MongoRepository<TherapySession, String> {

    List<TherapySession> findByPatientId(
            String patientId
    );

    List<TherapySession> findByTherapyPlanId(
            String therapyPlanId
    );

    List<TherapySession> findByTherapistId(
            String therapistId
    );

    List<TherapySession> findByRoomId(
            String roomId
    );

    List<TherapySession> findBySessionDate(
            LocalDate sessionDate
    );

    List<TherapySession> findByTherapyPlanIdAndDayNumber(
            String therapyPlanId,
            Integer dayNumber
    );
}