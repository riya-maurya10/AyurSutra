package com.ayursutra.repository;

import com.ayursutra.entity.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends MongoRepository<Room, String> {

    Optional<Room> findByRoomNumber(String roomNumber);

    boolean existsByRoomNumber(String roomNumber);

    List<Room> findByActiveTrue();

    List<Room> findByTypeAndActiveTrue(
            com.ayursutra.constant.RoomType type
    );
}