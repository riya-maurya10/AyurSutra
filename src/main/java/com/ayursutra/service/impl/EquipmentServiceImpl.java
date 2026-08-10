package com.ayursutra.service.impl;

import com.ayursutra.constant.EquipmentStatus;
import com.ayursutra.dto.request.EquipmentRequest;
import com.ayursutra.dto.response.EquipmentResponse;
import com.ayursutra.entity.Equipment;
import com.ayursutra.mapper.EquipmentMapper;
import com.ayursutra.repository.EquipmentRepository;
import com.ayursutra.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl
        implements EquipmentService {

    private final EquipmentRepository equipmentRepository;

    private final EquipmentMapper equipmentMapper;

    @Override
    public EquipmentResponse createEquipment(
            EquipmentRequest request
    ) {

        if (request.getAvailableQuantity()
                > request.getQuantity()) {

            throw new RuntimeException(
                    "Available quantity cannot exceed total quantity"
            );
        }

        if (equipmentRepository.existsByEquipmentCode(
                request.getEquipmentCode())) {

            throw new RuntimeException(
                    "Equipment with code "
                            + request.getEquipmentCode()
                            + " already exists"
            );
        }

        Equipment equipment =
                equipmentMapper.toEntity(request);

        Equipment savedEquipment =
                equipmentRepository.save(equipment);

        return equipmentMapper.toResponse(savedEquipment);
    }

    @Override
    public EquipmentResponse getEquipmentById(
            String id
    ) {

        Equipment equipment =
                equipmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found with id: "
                                                + id
                                )
                        );

        return equipmentMapper.toResponse(equipment);
    }

    @Override
    public List<EquipmentResponse> getAllEquipment() {

        return equipmentRepository.findAll()
                .stream()
                .map(equipmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<EquipmentResponse> getActiveEquipment() {

        return equipmentRepository.findByActiveTrue()
                .stream()
                .map(equipmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<EquipmentResponse> getAvailableEquipment() {

        return equipmentRepository
                .findByStatusAndActiveTrue(
                        EquipmentStatus.AVAILABLE
                )
                .stream()
                .filter(e ->
                        e.getAvailableQuantity() > 0
                )
                .map(equipmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<EquipmentResponse> getEquipmentByRoom(
            String roomId
    ) {

        return equipmentRepository
                .findByRoomIdAndActiveTrue(roomId)
                .stream()
                .map(equipmentMapper::toResponse)
                .toList();
    }

    @Override
    public EquipmentResponse updateEquipment(
            String id,
            EquipmentRequest request
    ) {

        if (request.getAvailableQuantity()
                > request.getQuantity()) {

            throw new RuntimeException(
                    "Available quantity cannot exceed total quantity"
            );
        }

        Equipment equipment =
                equipmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found with id: "
                                                + id
                                )
                        );

        if (!equipment.getEquipmentCode()
                .equals(request.getEquipmentCode())
                && equipmentRepository.existsByEquipmentCode(
                request.getEquipmentCode())) {

            throw new RuntimeException(
                    "Equipment with code "
                            + request.getEquipmentCode()
                            + " already exists"
            );
        }

        equipmentMapper.updateEntity(
                equipment,
                request
        );

        Equipment updatedEquipment =
                equipmentRepository.save(equipment);

        return equipmentMapper.toResponse(updatedEquipment);
    }

    @Override
    public void deleteEquipment(String id) {

        if (!equipmentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Equipment not found with id: " + id
            );
        }

        equipmentRepository.deleteById(id);
    }
}