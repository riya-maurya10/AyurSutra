package com.ayursutra.dto.request;

import com.ayursutra.constant.EquipmentStatus;
import com.ayursutra.constant.EquipmentType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EquipmentRequest {

    @NotBlank(message = "Equipment code is required")
    private String equipmentCode;

    @NotBlank(message = "Equipment name is required")
    private String name;

    @NotNull(message = "Equipment type is required")
    private EquipmentType type;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Available quantity is required")
    @Min(value = 0, message = "Available quantity cannot be negative")
    private Integer availableQuantity;

    private String roomId;

    @NotNull(message = "Equipment status is required")
    private EquipmentStatus status;

    private String description;

    private Boolean active = true;
}