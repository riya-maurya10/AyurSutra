package com.ayursutra.service.impl;

import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.response.AuditLogResponse;
import com.ayursutra.entity.AuditLog;
import com.ayursutra.repository.AuditLogRepository;
import com.ayursutra.security.UserPrincipal;
import com.ayursutra.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl
        implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public AuditLogResponse createAuditLog(
            AuditLogRequest request) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        AuditLog auditLog =
                new AuditLog();

        // ---------------------------------
        // Get logged-in user
        // ---------------------------------

        if (authentication != null &&
                authentication.getPrincipal()
                        instanceof UserPrincipal userPrincipal) {

            var user = userPrincipal.getUser();

            auditLog.setUserId(user.getId());
            auditLog.setUserEmail(user.getEmail());
            auditLog.setUserRole(
                    user.getRole().name()
            );
        }

        // ---------------------------------
        // Audit information
        // ---------------------------------

        auditLog.setAction(
                request.getAction()
        );

        auditLog.setEntityType(
                request.getEntityType()
        );

        auditLog.setEntityId(
                request.getEntityId()
        );

        auditLog.setDescription(
                request.getDescription()
        );

        auditLog.setTimestamp(
                LocalDateTime.now()
        );

        AuditLog saved =
                auditLogRepository.save(auditLog);

        return toResponse(saved);
    }

    @Override
    public List<AuditLogResponse> getAllAuditLogs() {

        return auditLogRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AuditLogResponse getAuditLogById(
            String id) {

        AuditLog auditLog =
                auditLogRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Audit log not found"
                                )
                        );

        return toResponse(auditLog);
    }

    @Override
    public List<AuditLogResponse> getAuditLogsByUser(
            String userId) {

        return auditLogRepository
                .findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<AuditLogResponse>
    getAuditLogsByEntityType(
            String entityType) {

        return auditLogRepository
                .findByEntityType(entityType)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<AuditLogResponse>
    getAuditLogsByEntityId(
            String entityId) {

        return auditLogRepository
                .findByEntityId(entityId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(
            AuditLog auditLog) {

        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getUserId(),
                auditLog.getUserEmail(),
                auditLog.getUserRole(),
                auditLog.getAction(),
                auditLog.getEntityType(),
                auditLog.getEntityId(),
                auditLog.getDescription(),
                auditLog.getTimestamp()
        );
    }
}