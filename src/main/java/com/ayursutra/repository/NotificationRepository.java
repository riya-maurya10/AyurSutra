package com.ayursutra.repository;

import com.ayursutra.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository
        extends MongoRepository<Notification, String> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(
            String recipientId
    );

    List<Notification> findByRecipientIdAndStatusOrderByCreatedAtDesc(
            String recipientId,
            String status
    );

    long countByRecipientIdAndStatus(
            String recipientId,
            String status
    );

    boolean existsByRecipientIdAndTherapySessionIdAndType(
            String recipientId,
            String therapySessionId,
            String type
    );
}