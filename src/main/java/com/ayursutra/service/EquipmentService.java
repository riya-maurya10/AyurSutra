package com.ayursutra.service;

import com.ayursutra.dto.request.EquipmentRequest;
import com.ayursutra.dto.response.EquipmentResponse;

import java.util.List;

public interface EquipmentService {

    EquipmentResponse createEquipment(
            EquipmentRequest request
    );

    EquipmentResponse getEquipmentById(
            String id
    );

    List<EquipmentResponse> getAllEquipment();

    List<EquipmentResponse> getActiveEquipment();

    List<EquipmentResponse> getAvailableEquipment();

    List<EquipmentResponse> getEquipmentByRoom(
            String roomId
    );

    EquipmentResponse updateEquipment(
            String id,
            EquipmentRequest request
    );

    void deleteEquipment(String id);
}