package com.ayursutra.mapper;

import com.ayursutra.dto.request.DietMealRequest;
import com.ayursutra.dto.request.DietPlanDayRequest;
import com.ayursutra.dto.request.DietPlanRequest;
import com.ayursutra.dto.response.DietPlanResponse;
import com.ayursutra.entity.DietMeal;
import com.ayursutra.entity.DietPlan;
import com.ayursutra.entity.DietPlanDay;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DietPlanMapper {

    public DietPlan toEntity(DietPlanRequest request) {

        DietPlan plan = new DietPlan();

        plan.setPatientId(request.getPatientId());
        plan.setTherapyPlanId(request.getTherapyPlanId());
        plan.setDoctorId(request.getDoctorId());
        plan.setPlanName(request.getPlanName());
        plan.setDiagnosis(request.getDiagnosis());
        plan.setStartDate(request.getStartDate());
        plan.setEndDate(request.getEndDate());
        plan.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : "ACTIVE"
        );
        plan.setNotes(request.getNotes());

        if (request.getDays() != null) {

            plan.setDays(
                    request.getDays()
                            .stream()
                            .map(this::toDayEntity)
                            .toList()
            );
        }

        return plan;
    }


    private DietPlanDay toDayEntity(
            DietPlanDayRequest request) {

        DietPlanDay day = new DietPlanDay();

        day.setDayNumber(request.getDayNumber());
        day.setDate(request.getDate());
        day.setPhase(request.getPhase());

        if (request.getMeals() != null) {

            day.setMeals(
                    request.getMeals()
                            .stream()
                            .map(this::toMealEntity)
                            .toList()
            );
        }

        return day;
    }


    private DietMeal toMealEntity(
            DietMealRequest request) {

        DietMeal meal = new DietMeal();

        meal.setSequenceOrder(
                request.getSequenceOrder()
        );

        meal.setMealType(
                request.getMealType()
        );

        meal.setMealTime(
                request.getMealTime()
        );

        meal.setFoodItems(
                request.getFoodItems()
        );

        meal.setInstructions(
                request.getInstructions()
        );

        meal.setRestrictions(
                request.getRestrictions()
        );

        return meal;
    }


    public DietPlanResponse toResponse(
            DietPlan plan) {

        DietPlanResponse response =
                new DietPlanResponse();

        response.setId(plan.getId());
        response.setPatientId(plan.getPatientId());
        response.setTherapyPlanId(
                plan.getTherapyPlanId()
        );
        response.setDoctorId(plan.getDoctorId());
        response.setPlanName(plan.getPlanName());
        response.setDiagnosis(plan.getDiagnosis());
        response.setStartDate(plan.getStartDate());
        response.setEndDate(plan.getEndDate());
        response.setStatus(plan.getStatus());
        response.setNotes(plan.getNotes());
        response.setDays(plan.getDays());

        return response;
    }
}