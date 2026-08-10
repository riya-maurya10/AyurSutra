package com.ayursutra.entity;

import com.ayursutra.constant.EquipmentStatus;
import com.ayursutra.constant.EquipmentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "equipment")
public class Equipment extends BaseEntity {

    private String equipmentCode;

    private String name;

    private EquipmentType type;

    private Integer quantity;

    private Integer availableQuantity;

    private String roomId;

    private EquipmentStatus status;

    private String description;

    private Boolean active = true;
}