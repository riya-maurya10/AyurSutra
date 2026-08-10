package com.ayursutra.service.impl;

import com.ayursutra.dto.request.RoomRequest;
import com.ayursutra.dto.response.RoomResponse;
import com.ayursutra.entity.Room;
import com.ayursutra.mapper.RoomMapper;
import com.ayursutra.repository.RoomRepository;
import com.ayursutra.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;

    @Override
    public RoomResponse createRoom(RoomRequest request) {

        if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new RuntimeException(
                    "Room with number " + request.getRoomNumber()
                            + " already exists"
            );
        }

        Room room = roomMapper.toEntity(request);

        Room savedRoom = roomRepository.save(room);

        return roomMapper.toResponse(savedRoom);
    }

    @Override
    public RoomResponse getRoomById(String id) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Room not found with id: " + id)
                );

        return roomMapper.toResponse(room);
    }

    @Override
    public List<RoomResponse> getAllRooms() {

        return roomRepository.findAll()
                .stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Override
    public List<RoomResponse> getActiveRooms() {

        return roomRepository.findByActiveTrue()
                .stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Override
    public RoomResponse updateRoom(
            String id,
            RoomRequest request
    ) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Room not found with id: " + id)
                );

        if (!room.getRoomNumber().equals(request.getRoomNumber())
                && roomRepository.existsByRoomNumber(request.getRoomNumber())) {

            throw new RuntimeException(
                    "Room with number "
                            + request.getRoomNumber()
                            + " already exists"
            );
        }

        roomMapper.updateEntity(room, request);

        Room updatedRoom = roomRepository.save(room);

        return roomMapper.toResponse(updatedRoom);
    }

    @Override
    public void deleteRoom(String id) {

        if (!roomRepository.existsById(id)) {
            throw new RuntimeException("Room not found with id: " + id);
        }

        roomRepository.deleteById(id);
    }
}