package com.ayursutra.service;

import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.response.AuditLogResponse;

import java.util.List;

public interface AuditService {

    AuditLogResponse createAuditLog(
            AuditLogRequest request
    );

    List<AuditLogResponse> getAllAuditLogs();

    AuditLogResponse getAuditLogById(
            String id
    );

    List<AuditLogResponse> getAuditLogsByUser(
            String userId
    );

    List<AuditLogResponse> getAuditLogsByEntityType(
            String entityType
    );

    List<AuditLogResponse> getAuditLogsByEntityId(
            String entityId
    );
}