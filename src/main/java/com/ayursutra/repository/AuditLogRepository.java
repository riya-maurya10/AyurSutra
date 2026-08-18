package com.ayursutra.repository;

import com.ayursutra.entity.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AuditLogRepository
        extends MongoRepository<AuditLog, String> {

    List<AuditLog> findByUserId(String userId);

    List<AuditLog> findByEntityType(String entityType);

    List<AuditLog> findByEntityId(String entityId);
}