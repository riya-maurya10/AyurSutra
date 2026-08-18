package com.ayursutra.service;

import com.ayursutra.dto.request.NotificationRequest;
import com.ayursutra.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse createNotification(
            NotificationRequest request
    );

    List<NotificationResponse> getAllNotifications();

    NotificationResponse getNotificationById(
            String id
    );

    List<NotificationResponse> getNotificationsByRecipient(
            String recipientId
    );

    List<NotificationResponse> getUnreadNotifications(
            String recipientId
    );

    long getUnreadCount(
            String recipientId
    );

    NotificationResponse markAsRead(
            String id
    );

    void deleteNotification(
            String id
    );

    void createTherapyReminder(
            String therapySessionId
    );
}