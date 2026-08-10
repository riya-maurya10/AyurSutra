package com.ayursutra.dto.response;

import com.ayursutra.constant.EquipmentStatus;
import com.ayursutra.constant.EquipmentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {

    private String id;

    private String equipmentCode;

    private String name;

    private EquipmentType type;

    private Integer quantity;

    private Integer availableQuantity;

    private String roomId;

    private EquipmentStatus status;

    private String description;

    private Boolean active;
}