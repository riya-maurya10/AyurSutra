package com.ayursutra.dto.response;

import com.ayursutra.constant.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private String id;

    private String userId;

    private String userEmail;

    private String userRole;

    private AuditAction action;

    private String entityType;

    private String entityId;

    private String entityName;

    private String description;

    private LocalDateTime timestamp;
}