package com.ayursutra.service.impl;

import com.ayursutra.dto.request.TherapyPlanRequest;
import com.ayursutra.dto.response.TherapyPlanResponse;
import com.ayursutra.entity.TherapyPlan;
import com.ayursutra.mapper.TherapyPlanMapper;
import com.ayursutra.repository.TherapyPlanRepository;
import com.ayursutra.service.TherapyPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TherapyPlanServiceImpl
        implements TherapyPlanService {

    private final TherapyPlanRepository therapyPlanRepository;
    private final TherapyPlanMapper therapyPlanMapper;

    @Override
    public TherapyPlanResponse createPlan(
            TherapyPlanRequest request) {

        if (request.getEndDate()
                .isBefore(request.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }

        TherapyPlan plan =
                therapyPlanMapper.toEntity(request);

        TherapyPlan savedPlan =
                therapyPlanRepository.save(plan);

        return therapyPlanMapper.toResponse(savedPlan);
    }

    @Override
    public List<TherapyPlanResponse> getAllPlans() {

        return therapyPlanRepository.findAll()
                .stream()
                .map(therapyPlanMapper::toResponse)
                .toList();
    }

    @Override
    public TherapyPlanResponse getPlanById(
            String id) {

        TherapyPlan plan =
                therapyPlanRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy plan not found"
                                ));

        return therapyPlanMapper.toResponse(plan);
    }

    @Override
    public TherapyPlanResponse updatePlan(
            String id,
            TherapyPlanRequest request) {

        if (request.getEndDate()
                .isBefore(request.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }

        TherapyPlan plan =
                therapyPlanRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy plan not found"
                                ));

        plan.setPatientId(request.getPatientId());
        plan.setDoctorId(request.getDoctorId());
        plan.setPlanName(request.getPlanName());
        plan.setDiagnosis(request.getDiagnosis());
        plan.setStartDate(request.getStartDate());
        plan.setEndDate(request.getEndDate());
        plan.setStatus(request.getStatus());
        plan.setTherapies(request.getTherapies());

        TherapyPlan updatedPlan =
                therapyPlanRepository.save(plan);

        return therapyPlanMapper.toResponse(updatedPlan);
    }

    @Override
    public void deletePlan(String id) {

        if (!therapyPlanRepository.existsById(id)) {

            throw new RuntimeException(
                    "Therapy plan not found"
            );
        }

        therapyPlanRepository.deleteById(id);
    }
}