package com.ayursutra.controller;

import com.ayursutra.dto.request.RoomRequest;
import com.ayursutra.dto.response.RoomResponse;
import com.ayursutra.service.RoomService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<?> createRoom(
            @Valid @RequestBody RoomRequest request
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room created successfully",
                        roomService.createRoom(request)
                )
        );
    }

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

    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room fetched successfully",
                        roomService.getRoomById(id)
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(
            @PathVariable String id,
            @Valid @RequestBody RoomRequest request
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room updated successfully",
                        roomService.updateRoom(id, request)
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(
            @PathVariable String id
    ) {

        roomService.deleteRoom(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Room deleted successfully",
                        null
                )
        );
    }
}