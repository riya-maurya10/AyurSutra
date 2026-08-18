package com.ayursutra.dto.response;

import com.ayursutra.constant.NotificationStatus;
import com.ayursutra.constant.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private String id;

    private String recipientId;

    private String patientId;

    private String therapistId;

    private String doctorId;

    private String therapySessionId;

    private String therapyPlanId;

    private NotificationType type;

    private NotificationStatus status;

    private String title;

    private String message;

    private LocalDateTime scheduledAt;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;
}