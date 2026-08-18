package com.ayursutra.entity;

import com.ayursutra.constant.NotificationStatus;
import com.ayursutra.constant.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
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