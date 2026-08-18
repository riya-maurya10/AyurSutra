package com.ayursutra.dto.request;

import com.ayursutra.constant.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequest {

    @NotBlank
    private String recipientId;

    private String patientId;

    private String therapistId;

    private String doctorId;

    private String therapySessionId;

    private String therapyPlanId;

    @NotNull
    private NotificationType type;

    @NotBlank
    private String title;

    @NotBlank
    private String message;
}