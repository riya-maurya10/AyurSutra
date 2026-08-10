package com.ayursutra.repository;

import com.ayursutra.constant.EquipmentStatus;
import com.ayursutra.constant.EquipmentType;
import com.ayursutra.entity.Equipment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface EquipmentRepository
        extends MongoRepository<Equipment, String> {

    Optional<Equipment> findByEquipmentCode(String equipmentCode);

    boolean existsByEquipmentCode(String equipmentCode);

    List<Equipment> findByActiveTrue();

    List<Equipment> findByStatusAndActiveTrue(
            EquipmentStatus status
    );

    List<Equipment> findByTypeAndActiveTrue(
            EquipmentType type
    );

    List<Equipment> findByRoomIdAndActiveTrue(
            String roomId
    );
}