package com.ayursutra.service.impl;

import com.ayursutra.dto.request.DietPlanRequest;
import com.ayursutra.dto.response.DietPlanResponse;
import com.ayursutra.entity.DietPlan;
import com.ayursutra.mapper.DietPlanMapper;
import com.ayursutra.repository.DietPlanRepository;
import com.ayursutra.service.DietPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DietPlanServiceImpl
        implements DietPlanService {

    private final DietPlanRepository dietPlanRepository;

    private final DietPlanMapper dietPlanMapper;


    @Override
    public DietPlanResponse createPlan(
            DietPlanRequest request) {

        validateDates(request);

        DietPlan plan =
                dietPlanMapper.toEntity(request);

        DietPlan savedPlan =
                dietPlanRepository.save(plan);

        return dietPlanMapper.toResponse(
                savedPlan
        );
    }


    @Override
    public List<DietPlanResponse> getAllPlans() {

        return dietPlanRepository.findAll()
                .stream()
                .map(dietPlanMapper::toResponse)
                .toList();
    }


    @Override
    public DietPlanResponse getPlanById(
            String id) {

        DietPlan plan =
                dietPlanRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Diet plan not found"
                                )
                        );

        return dietPlanMapper.toResponse(plan);
    }


    @Override
    public List<DietPlanResponse>
    getPlansByPatient(
            String patientId) {

        return dietPlanRepository
                .findByPatientId(patientId)
                .stream()
                .map(dietPlanMapper::toResponse)
                .toList();
    }


    @Override
    public List<DietPlanResponse>
    getPlansByTherapyPlan(
            String therapyPlanId) {

        return dietPlanRepository
                .findByTherapyPlanId(therapyPlanId)
                .stream()
                .map(dietPlanMapper::toResponse)
                .toList();
    }


    @Override
    public List<DietPlanResponse>
    getPlansByDoctor(
            String doctorId) {

        return dietPlanRepository
                .findByDoctorId(doctorId)
                .stream()
                .map(dietPlanMapper::toResponse)
                .toList();
    }


    @Override
    public DietPlanResponse updatePlan(
            String id,
            DietPlanRequest request) {

        validateDates(request);

        DietPlan plan =
                dietPlanRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Diet plan not found"
                                )
                        );

        DietPlan updated =
                dietPlanMapper.toEntity(request);

        updated.setId(plan.getId());

        DietPlan saved =
                dietPlanRepository.save(updated);

        return dietPlanMapper.toResponse(saved);
    }


    @Override
    public void deletePlan(
            String id) {

        if (!dietPlanRepository.existsById(id)) {

            throw new RuntimeException(
                    "Diet plan not found"
            );
        }

        dietPlanRepository.deleteById(id);
    }


    private void validateDates(
            DietPlanRequest request) {

        if (request.getEndDate()
                .isBefore(request.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }

        if (request.getDays() != null) {

            for (var day : request.getDays()) {

                if (day.getDayNumber() == null ||
                        day.getDayNumber() <= 0) {

                    throw new RuntimeException(
                            "Day number must be greater than zero"
                    );
                }

                if (day.getDate() == null) {

                    throw new RuntimeException(
                            "Diet day date cannot be null"
                    );
                }

                if (day.getDate()
                        .isBefore(request.getStartDate()) ||
                        day.getDate()
                                .isAfter(request.getEndDate())) {

                    throw new RuntimeException(
                            "Diet day date must be within plan dates"
                    );
                }
            }
        }
    }
}