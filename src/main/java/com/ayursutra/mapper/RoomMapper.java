package com.ayursutra.mapper;

import com.ayursutra.dto.request.RoomRequest;
import com.ayursutra.dto.response.RoomResponse;
import com.ayursutra.entity.Room;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {

    public Room toEntity(RoomRequest request) {

        Room room = new Room();

        room.setRoomNumber(request.getRoomNumber());
        room.setName(request.getName());
        room.setType(request.getType());
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        room.setActive(
                request.getActive() != null
                        ? request.getActive()
                        : true
        );

        return room;
    }

    public RoomResponse toResponse(Room room) {

        return new RoomResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getName(),
                room.getType(),
                room.getCapacity(),
                room.getDescription(),
                room.getActive()
        );
    }

    public void updateEntity(Room room, RoomRequest request) {

        room.setRoomNumber(request.getRoomNumber());
        room.setName(request.getName());
        room.setType(request.getType());
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());

        if (request.getActive() != null) {
            room.setActive(request.getActive());
        }
    }
}