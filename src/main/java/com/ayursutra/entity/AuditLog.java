package com.ayursutra.entity;

import com.ayursutra.constant.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {

    private String id;

    private String userId;

    private String userEmail;

    private String userRole;

    private AuditAction action;

    private String entityType;

    private String entityId;

    private String description;

    private LocalDateTime timestamp;
}