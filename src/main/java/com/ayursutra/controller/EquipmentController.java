package com.ayursutra.controller;

import com.ayursutra.dto.request.EquipmentRequest;
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

    @PostMapping
    public ResponseEntity<?> createEquipment(
            @Valid @RequestBody EquipmentRequest request
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Equipment created successfully",
                        equipmentService.createEquipment(request)
                )
        );
    }

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

    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getEquipmentByRoom(
            @PathVariable String roomId
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room equipment fetched successfully",
                        equipmentService.getEquipmentByRoom(roomId)
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEquipmentById(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Equipment fetched successfully",
                        equipmentService.getEquipmentById(id)
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEquipment(
            @PathVariable String id,
            @Valid @RequestBody EquipmentRequest request
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Equipment updated successfully",
                        equipmentService.updateEquipment(
                                id,
                                request
                        )
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipment(
            @PathVariable String id
    ) {

        equipmentService.deleteEquipment(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Equipment deleted successfully",
                        null
                )
        );
    }
}