package com.ayursutra.dto.request;

import lombok.Data;

@Data
public class DietMealRequest {

    private Integer sequenceOrder;

    private String mealType;

    private String mealTime;

    private String foodItems;

    private String instructions;

    private String restrictions;
}