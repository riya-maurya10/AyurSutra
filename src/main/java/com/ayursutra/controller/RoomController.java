package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.AuditLogRequest;
import com.ayursutra.dto.request.RoomRequest;
import com.ayursutra.dto.response.RoomResponse;
import com.ayursutra.service.AuditService;
import com.ayursutra.service.RoomService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    private final AuditService auditService;


    // =========================
    // CREATE
    // =========================

    @PostMapping
    public ResponseEntity<?> createRoom(
            @Valid @RequestBody RoomRequest request) {

        RoomResponse room =
                roomService.createRoom(request);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.CREATE);
        audit.setEntityType("ROOM");
        audit.setEntityId(room.getId());
        audit.setDescription(
                "Room created"
        );

        auditService.createAuditLog(audit);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room created successfully",
                        room
                )
        );
    }


    // =========================
    // GET ALL
    // =========================

    @GetMapping
    public ResponseEntity<?> getAllRooms() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Rooms fetched successfully",
                        roomService.getAllRooms()
                )
        );
    }


    // =========================
    // GET ACTIVE
    // =========================

    @GetMapping("/active")
    public ResponseEntity<?> getActiveRooms() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Active rooms fetched successfully",
                        roomService.getActiveRooms()
                )
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room fetched successfully",
                        roomService.getRoomById(id)
                )
        );
    }


    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(
            @PathVariable String id,
            @Valid @RequestBody RoomRequest request) {

        RoomResponse room =
                roomService.updateRoom(
                        id,
                        request
                );

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.UPDATE);
        audit.setEntityType("ROOM");
        audit.setEntityId(room.getId());
        audit.setDescription(
                "Room updated"
        );

        auditService.createAuditLog(audit);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room updated successfully",
                        room
                )
        );
    }


    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(
            @PathVariable String id) {

        roomService.deleteRoom(id);

        AuditLogRequest audit =
                new AuditLogRequest();

        audit.setAction(AuditAction.DELETE);
        audit.setEntityType("ROOM");
        audit.setEntityId(id);
        audit.setDescription(
                "Room deleted"
        );

        auditService.createAuditLog(audit);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room deleted successfully",
                        null
                )
        );
    }
}