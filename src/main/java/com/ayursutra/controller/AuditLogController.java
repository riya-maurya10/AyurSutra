package com.ayursutra.controller;

import com.ayursutra.dto.response.AuditLogResponse;
import com.ayursutra.service.AuditService;
import com.ayursutra.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditService auditService;

    // ---------------------------------
    // GET ALL AUDIT LOGS
    // ---------------------------------

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<AuditLogResponse>> getAllAuditLogs() {

        return new ApiResponse<>(
                true,
                "Audit logs fetched successfully",
                auditService.getAllAuditLogs()
        );
    }

    // ---------------------------------
    // GET AUDIT LOG BY ID
    // ---------------------------------

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AuditLogResponse> getAuditLogById(
            @PathVariable String id) {

        return new ApiResponse<>(
                true,
                "Audit log fetched successfully",
                auditService.getAuditLogById(id)
        );
    }

    // ---------------------------------
    // GET BY USER
    // ---------------------------------

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<AuditLogResponse>> getAuditLogsByUser(
            @PathVariable String userId) {

        return new ApiResponse<>(
                true,
                "User audit logs fetched successfully",
                auditService.getAuditLogsByUser(userId)
        );
    }

    // ---------------------------------
    // GET BY ENTITY TYPE
    // ---------------------------------

    @GetMapping("/entity-type/{entityType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<AuditLogResponse>> getAuditLogsByEntityType(
            @PathVariable String entityType) {

        return new ApiResponse<>(
                true,
                "Entity audit logs fetched successfully",
                auditService.getAuditLogsByEntityType(entityType)
        );
    }

    // ---------------------------------
    // GET BY ENTITY ID
    // ---------------------------------

    @GetMapping("/entity/{entityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<AuditLogResponse>> getAuditLogsByEntityId(
            @PathVariable String entityId) {

        return new ApiResponse<>(
                true,
                "Entity audit logs fetched successfully",
                auditService.getAuditLogsByEntityId(entityId)
        );
    }
}