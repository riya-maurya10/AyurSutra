package com.ayursutra.mapper;

import com.ayursutra.dto.request.EquipmentRequest;
import com.ayursutra.dto.response.EquipmentResponse;
import com.ayursutra.entity.Equipment;
import org.springframework.stereotype.Component;

@Component
public class EquipmentMapper {

    public Equipment toEntity(EquipmentRequest request) {

        Equipment equipment = new Equipment();

        equipment.setEquipmentCode(request.getEquipmentCode());
        equipment.setName(request.getName());
        equipment.setType(request.getType());
        equipment.setQuantity(request.getQuantity());
        equipment.setAvailableQuantity(request.getAvailableQuantity());
        equipment.setRoomId(request.getRoomId());
        equipment.setStatus(request.getStatus());
        equipment.setDescription(request.getDescription());

        equipment.setActive(
                request.getActive() != null
                        ? request.getActive()
                        : true
        );

        return equipment;
    }

    public EquipmentResponse toResponse(Equipment equipment) {

        return new EquipmentResponse(
                equipment.getId(),
                equipment.getEquipmentCode(),
                equipment.getName(),
                equipment.getType(),
                equipment.getQuantity(),
                equipment.getAvailableQuantity(),
                equipment.getRoomId(),
                equipment.getStatus(),
                equipment.getDescription(),
                equipment.getActive()
        );
    }

    public void updateEntity(
            Equipment equipment,
            EquipmentRequest request
    ) {

        equipment.setEquipmentCode(request.getEquipmentCode());
        equipment.setName(request.getName());
        equipment.setType(request.getType());
        equipment.setQuantity(request.getQuantity());
        equipment.setAvailableQuantity(
                request.getAvailableQuantity()
        );
        equipment.setRoomId(request.getRoomId());
        equipment.setStatus(request.getStatus());
        equipment.setDescription(request.getDescription());

        if (request.getActive() != null) {
            equipment.setActive(request.getActive());
        }
    }
}