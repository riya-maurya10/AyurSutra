package com.ayursutra.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DietMeal {

    private Integer sequenceOrder;

    private String mealType;

    private String mealTime;

    private String foodItems;

    private String instructions;

    private String restrictions;
}