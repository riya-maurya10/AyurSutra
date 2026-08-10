package com.ayursutra.service;

import com.ayursutra.dto.request.RoomRequest;
import com.ayursutra.dto.response.RoomResponse;

import java.util.List;

public interface RoomService {

    RoomResponse createRoom(RoomRequest request);

    RoomResponse getRoomById(String id);

    List<RoomResponse> getAllRooms();

    List<RoomResponse> getActiveRooms();

    RoomResponse updateRoom(String id, RoomRequest request);

    void deleteRoom(String id);
}