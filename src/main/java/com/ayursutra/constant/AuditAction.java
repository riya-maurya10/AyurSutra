package com.ayursutra.constant;

public enum AuditAction {

    // Record lifecycle
    CREATE,
    UPDATE,
    DELETE,

    // Account / access management
    ACTIVATE,
    DEACTIVATE,
    LOGIN,
    LOGOUT,

    // Clinical / operational status changes
    STATUS_CHANGE,

    // Record viewing / access
    READ
}