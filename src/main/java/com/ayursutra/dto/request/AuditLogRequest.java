package com.ayursutra.dto.request;

import com.ayursutra.constant.AuditAction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AuditLogRequest {

    @NotNull
    private AuditAction action;

    @NotBlank
    private String entityType;

    private String entityId;

    private String entityName;

    @NotBlank
    private String description;
}