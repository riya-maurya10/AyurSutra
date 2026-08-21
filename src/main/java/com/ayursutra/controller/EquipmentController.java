package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.request.EquipmentRequest;
import com.ayursutra.service.AuditService;
import com.ayursutra.service.EquipmentService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    private final AuditService auditService;


    // =========================
    // CREATE
    // =========================

    @PostMapping
    public ResponseEntity<?> createEquipment(
            @Valid @RequestBody EquipmentRequest request) {

        var equipment =
                equipmentService.createEquipment(request);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.CREATE);
        audit.setEntityType("EQUIPMENT");
        audit.setEntityId(equipment.getId());
        audit.setDescription(
                "Equipment created"
        );

        auditService.createAuditLog(audit);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Equipment created successfully",
                        equipment
                )
        );
    }


    // =========================
    // GET ALL
    // =========================

    @GetMapping
    public ResponseEntity<?> getAllEquipment() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Equipment fetched successfully",
                        equipmentService.getAllEquipment()
                )
        );
    }


    // =========================
    // GET ACTIVE
    // =========================

    @GetMapping("/active")
    public ResponseEntity<?> getActiveEquipment() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Active equipment fetched successfully",
                        equipmentService.getActiveEquipment()
                )
        );
    }


    // =========================
    // GET AVAILABLE
    // =========================

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableEquipment() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Available equipment fetched successfully",
                        equipmentService.getAvailableEquipment()
                )
        );
    }


    // =========================
    // GET BY ROOM
    // =========================

    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getEquipmentByRoom(
            @PathVariable String roomId) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room equipment fetched successfully",
                        equipmentService.getEquipmentByRoom(roomId)
                )
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<?> getEquipmentById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Equipment fetched successfully",
                        equipmentService.getEquipmentById(id)
                )
        );
    }


    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEquipment(
            @PathVariable String id,
            @Valid @RequestBody EquipmentRequest request) {

        var equipment =
                equipmentService.updateEquipment(
                        id,
                        request
                );

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.UPDATE);
        audit.setEntityType("EQUIPMENT");
        audit.setEntityId(equipment.getId());
        audit.setDescription(
                "Equipment updated"
        );

        auditService.createAuditLog(audit);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Equipment updated successfully",
                        equipment
                )
        );
    }


    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipment(
            @PathVariable String id) {

        equipmentService.deleteEquipment(id);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.DELETE);
        audit.setEntityType("EQUIPMENT");
        audit.setEntityId(id);
        audit.setDescription(
                "Equipment deleted"
        );

        auditService.createAuditLog(audit);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Equipment deleted successfully",
                        null
                )
        );
    }
}