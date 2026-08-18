package com.ayursutra.controller;

import com.ayursutra.dto.request.NotificationRequest;
import com.ayursutra.dto.response.NotificationResponse;
import com.ayursutra.service.NotificationService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;


    @PostMapping
    public ApiResponse<NotificationResponse>
    createNotification(
            @Valid @RequestBody NotificationRequest request) {

        return new ApiResponse<>(
                true,
                "Notification created successfully",
                notificationService.createNotification(request)
        );
    }


    @GetMapping
    public ApiResponse<List<NotificationResponse>>
    getAllNotifications() {

        return new ApiResponse<>(
                true,
                "Notifications fetched successfully",
                notificationService.getAllNotifications()
        );
    }


    @GetMapping("/{id}")
    public ApiResponse<NotificationResponse>
    getNotificationById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Notification fetched successfully",
                notificationService.getNotificationById(id)
        );
    }


    @GetMapping("/recipient/{recipientId}")
    public ApiResponse<List<NotificationResponse>>
    getNotificationsByRecipient(
            @PathVariable String recipientId) {

        return new ApiResponse<>(
                true,
                "Recipient notifications fetched successfully",
                notificationService
                        .getNotificationsByRecipient(
                                recipientId
                        )
        );
    }


    @GetMapping("/recipient/{recipientId}/unread")
    public ApiResponse<List<NotificationResponse>>
    getUnreadNotifications(
            @PathVariable String recipientId) {

        return new ApiResponse<>(
                true,
                "Unread notifications fetched successfully",
                notificationService
                        .getUnreadNotifications(
                                recipientId
                        )
        );
    }


    @GetMapping("/recipient/{recipientId}/unread-count")
    public ApiResponse<Long>
    getUnreadCount(
            @PathVariable String recipientId) {

        return new ApiResponse<>(
                true,
                "Unread notification count fetched successfully",
                notificationService
                        .getUnreadCount(
                                recipientId
                        )
        );
    }


    @PutMapping("/{id}/read")
    public ApiResponse<NotificationResponse>
    markAsRead(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Notification marked as read",
                notificationService.markAsRead(id)
        );
    }


    @DeleteMapping("/{id}")
    public ApiResponse<String>
    deleteNotification(
            @PathVariable String id) {

        notificationService.deleteNotification(id);

        return new ApiResponse<>(
                true,
                "Notification deleted successfully",
                null
        );
    }


    @PostMapping("/therapy-reminder/{sessionId}")
    public ApiResponse<String>
    createTherapyReminder(
            @PathVariable String sessionId) {

        notificationService.createTherapyReminder(
                sessionId
        );

        return new ApiResponse<>(
                true,
                "Therapy reminder created successfully",
                null
        );
    }
}