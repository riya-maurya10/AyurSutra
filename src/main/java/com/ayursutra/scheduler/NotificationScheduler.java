package com.ayursutra.scheduler;

import com.ayursutra.dto.response.TherapySessionResponse;
import com.ayursutra.service.NotificationService;
import com.ayursutra.service.TherapySessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final TherapySessionService therapySessionService;

    private final NotificationService notificationService;


    /*
     * Runs every minute.
     *
     * Finds today's therapy sessions and creates
     * a reminder when the session is within
     * the next 30 minutes.
     */
    @Scheduled(fixedRate = 60000)
    public void generateTherapyReminders() {

        LocalDate today =
                LocalDate.now();

        LocalDateTime now =
                LocalDateTime.now();

        LocalDateTime reminderWindowEnd =
                now.plusMinutes(30);


        List<TherapySessionResponse> sessions =
                therapySessionService
                        .getSessionsByDate(
                                today.toString()
                        );


        for (TherapySessionResponse session :
                sessions) {

            if (session.getStartTime() == null) {
                continue;
            }

            LocalDateTime sessionDateTime =
                    LocalDateTime.of(
                            today,
                            session.getStartTime()
                    );


            if (!sessionDateTime.isBefore(now)
                    && !sessionDateTime.isAfter(
                    reminderWindowEnd
            )) {

                notificationService
                        .createTherapyReminder(
                                session.getId()
                        );
            }
        }
    }
}