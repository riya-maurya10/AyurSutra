package com.ayursutra.service.impl;

import com.ayursutra.dto.request.TherapyPlanRequest;
import com.ayursutra.dto.response.TherapyPlanResponse;
import com.ayursutra.entity.TherapyPlan;
import com.ayursutra.entity.TherapySession;
import com.ayursutra.repository.DoctorRepository;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.repository.TherapyPlanRepository;
import com.ayursutra.repository.TherapySessionRepository;
import com.ayursutra.service.TherapyPlanService;
import com.ayursutra.mapper.TherapyPlanMapper;
import com.ayursutra.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TherapyPlanServiceImpl implements TherapyPlanService {

    private final TherapyPlanRepository therapyPlanRepository;
    private final TherapyPlanMapper therapyPlanMapper;

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    /*
     * Used to calculate Therapy Plan status automatically
     * from its Therapy Sessions.
     */
    private final TherapySessionRepository therapySessionRepository;


    // =========================================================
    // CREATE PLAN
    // =========================================================

    @Override
    public TherapyPlanResponse createPlan(TherapyPlanRequest request) {

        validatePlanDates(request);

        TherapyPlan plan =
                therapyPlanMapper.toEntity(request);

        /*
         * New plan always starts as PLANNED.
         */
        plan.setStatus("PLANNED");

        TherapyPlan saved =
                therapyPlanRepository.save(plan);

        return therapyPlanMapper.toResponse(saved);
    }


    // =========================================================
    // GET ALL PLANS
    // =========================================================

    @Override
    public List<TherapyPlanResponse> getAllPlans() {

        List<TherapyPlan> plans =
                therapyPlanRepository.findAll();

        /*
         * IMPORTANT:
         *
         * Recalculate status before sending plans
         * to Admin / Doctor / other consumers.
         *
         * This also fixes old plans whose stored status
         * was not updated previously.
         */
        plans.forEach(this::refreshPlanStatus);

        return plans.stream()
                .map(therapyPlanMapper::toResponse)
                .toList();
    }


    // =========================================================
    // GET MY PATIENT PLANS
    // =========================================================

    @Override
    public List<TherapyPlanResponse> getMyPlans() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        String userId =
                principal.getUser().getId();

        var patient =
                patientRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient profile not found"
                                )
                        );

        List<TherapyPlan> plans =
                therapyPlanRepository
                        .findByPatientId(patient.getId());

        /*
         * Recalculate status for every plan.
         */
        plans.forEach(this::refreshPlanStatus);

        return plans.stream()
                .map(therapyPlanMapper::toResponse)
                .toList();
    }


    // =========================================================
    // GET MY DOCTOR PLANS
    // =========================================================

    @Override
    public List<TherapyPlanResponse> getMyDoctorPlans() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        String userId =
                principal.getUser().getId();

        var doctor =
                doctorRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Doctor profile not found"
                                )
                        );

        List<TherapyPlan> plans =
                therapyPlanRepository
                        .findByDoctorId(doctor.getId());

        /*
         * Recalculate status for every plan.
         */
        plans.forEach(this::refreshPlanStatus);

        return plans.stream()
                .map(therapyPlanMapper::toResponse)
                .toList();
    }


    // =========================================================
    // GET PLAN BY ID
    // =========================================================

    @Override
    public TherapyPlanResponse getPlanById(String id) {

        TherapyPlan plan =
                therapyPlanRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy plan not found"
                                )
                        );

        /*
         * Recalculate status before returning.
         */
        refreshPlanStatus(plan);

        return therapyPlanMapper.toResponse(plan);
    }


    // =========================================================
    // UPDATE PLAN
    // =========================================================

    @Override
    public TherapyPlanResponse updatePlan(
            String id,
            TherapyPlanRequest request
    ) {

        validatePlanDates(request);

        TherapyPlan existingPlan =
                therapyPlanRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy plan not found"
                                )
                        );

        existingPlan.setPatientId(
                request.getPatientId()
        );

        existingPlan.setDoctorId(
                request.getDoctorId()
        );

        existingPlan.setPlanName(
                request.getPlanName()
        );

        existingPlan.setDiagnosis(
                request.getDiagnosis()
        );

        existingPlan.setStartDate(
                request.getStartDate()
        );

        existingPlan.setEndDate(
                request.getEndDate()
        );

        /*
         * Do NOT blindly trust the status coming
         * from frontend.
         *
         * Status should be derived from sessions.
         */

        existingPlan.setTherapies(
                request.getTherapies()
        );

        TherapyPlan saved =
                therapyPlanRepository.save(existingPlan);

        /*
         * Recalculate after update.
         */
        refreshPlanStatus(saved);

        return therapyPlanMapper.toResponse(saved);
    }


    // =========================================================
    // DELETE PLAN
    // =========================================================

    @Override
    public void deletePlan(String id) {

        if (!therapyPlanRepository.existsById(id)) {
            throw new RuntimeException(
                    "Therapy plan not found"
            );
        }

        therapyPlanRepository.deleteById(id);
    }


    // =========================================================
    // AUTOMATIC STATUS CALCULATION
    // =========================================================

    private void refreshPlanStatus(TherapyPlan plan) {

        if (plan == null || plan.getId() == null) {
            return;
        }

        /*
         * If the plan itself has been explicitly cancelled,
         * don't automatically change it.
         */
        if ("CANCELLED".equalsIgnoreCase(
                plan.getStatus()
        )) {
            return;
        }

        List<TherapySession> sessions =
                therapySessionRepository
                        .findByTherapyPlanId(plan.getId());

        /*
         * No sessions yet.
         */
        if (sessions == null || sessions.isEmpty()) {

            if (!"PLANNED".equalsIgnoreCase(
                    plan.getStatus()
            )) {

                plan.setStatus("PLANNED");

                therapyPlanRepository.save(plan);
            }

            return;
        }


        // =====================================================
        // CHECK COMPLETION
        // =====================================================

        boolean allCompleted =
                sessions.stream()
                        .allMatch(session ->
                                "COMPLETED".equalsIgnoreCase(
                                        session.getStatus() != null
                                                ? session.getStatus().name()
                                                : ""
                                )
                        );

        if (allCompleted) {

            if (!"COMPLETED".equalsIgnoreCase(
                    plan.getStatus()
            )) {

                plan.setStatus("COMPLETED");

                therapyPlanRepository.save(plan);
            }

            return;
        }


        // =====================================================
        // CHECK WHETHER TREATMENT HAS STARTED
        // =====================================================

        boolean treatmentStarted =
                sessions.stream()
                        .anyMatch(session -> {

                            if (session.getStatus() == null) {
                                return false;
                            }

                            String status =
                                    session.getStatus().name();

                            return "IN_PROGRESS".equalsIgnoreCase(status)
                                    || "COMPLETED".equalsIgnoreCase(status);
                        });


        if (treatmentStarted) {

            if (!"IN_PROGRESS".equalsIgnoreCase(
                    plan.getStatus()
            )) {

                plan.setStatus("IN_PROGRESS");

                therapyPlanRepository.save(plan);
            }

            return;
        }


        // =====================================================
        // OTHERWISE PLAN IS STILL PLANNED
        // =====================================================

        if (!"PLANNED".equalsIgnoreCase(
                plan.getStatus()
        )) {

            plan.setStatus("PLANNED");

            therapyPlanRepository.save(plan);
        }
    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validatePlanDates(
            TherapyPlanRequest request
    ) {

        if (request.getStartDate() == null) {
            throw new IllegalArgumentException(
                    "Start date is required"
            );
        }

        if (request.getEndDate() == null) {
            throw new IllegalArgumentException(
                    "End date is required"
            );
        }

        if (request.getEndDate()
                .isBefore(request.getStartDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }
    }
}