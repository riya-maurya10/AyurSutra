package com.ayursutra.service.impl;

import com.ayursutra.dto.request.PatientProgressRequest;
import com.ayursutra.dto.response.PatientProgressResponse;
import com.ayursutra.entity.PatientProgress;
import com.ayursutra.mapper.PatientProgressMapper;
import com.ayursutra.repository.PatientProgressRepository;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.repository.TherapyPlanRepository;
import com.ayursutra.service.PatientProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientProgressServiceImpl
        implements PatientProgressService {

    private final PatientProgressRepository
            patientProgressRepository;

    private final PatientProgressMapper
            patientProgressMapper;

    private final PatientRepository
            patientRepository;

    private final TherapyPlanRepository
            therapyPlanRepository;


    @Override
    public PatientProgressResponse createProgress(
            PatientProgressRequest request) {

        validateRequest(request);

        PatientProgress progress =
                patientProgressMapper.toEntity(request);

        PatientProgress savedProgress =
                patientProgressRepository.save(progress);

        return patientProgressMapper.toResponse(
                savedProgress
        );
    }


    @Override
    public List<PatientProgressResponse>
    getAllProgress() {

        return patientProgressRepository.findAll()
                .stream()
                .map(patientProgressMapper::toResponse)
                .toList();
    }


    @Override
    public PatientProgressResponse getProgressById(
            String id) {

        PatientProgress progress =
                patientProgressRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient progress assessment not found"
                                )
                        );

        return patientProgressMapper.toResponse(
                progress
        );
    }


    @Override
    public List<PatientProgressResponse>
    getProgressByPatient(
            String patientId) {

        if (!patientRepository.existsById(patientId)) {

            throw new RuntimeException(
                    "Patient not found"
            );
        }

        return patientProgressRepository
                .findByPatientId(patientId)
                .stream()
                .map(patientProgressMapper::toResponse)
                .toList();
    }


    @Override
    public List<PatientProgressResponse>
    getProgressByTherapyPlan(
            String therapyPlanId) {

        if (!therapyPlanRepository
                .existsById(therapyPlanId)) {

            throw new RuntimeException(
                    "Therapy plan not found"
            );
        }

        return patientProgressRepository
                .findByTherapyPlanId(therapyPlanId)
                .stream()
                .map(patientProgressMapper::toResponse)
                .toList();
    }


    @Override
    public List<PatientProgressResponse>
    getProgressByPatientAndTherapyPlan(
            String patientId,
            String therapyPlanId) {

        if (!patientRepository.existsById(patientId)) {

            throw new RuntimeException(
                    "Patient not found"
            );
        }

        if (!therapyPlanRepository
                .existsById(therapyPlanId)) {

            throw new RuntimeException(
                    "Therapy plan not found"
            );
        }

        return patientProgressRepository
                .findByPatientIdAndTherapyPlanId(
                        patientId,
                        therapyPlanId
                )
                .stream()
                .map(patientProgressMapper::toResponse)
                .toList();
    }


    @Override
    public PatientProgressResponse updateProgress(
            String id,
            PatientProgressRequest request) {

        validateRequest(request);

        PatientProgress progress =
                patientProgressRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient progress assessment not found"
                                )
                        );

        progress.setPatientId(
                request.getPatientId()
        );

        progress.setTherapyPlanId(
                request.getTherapyPlanId()
        );

        progress.setAssessmentDate(
                request.getAssessmentDate()
        );

        progress.setDayNumber(
                request.getDayNumber()
        );

        progress.setSymptoms(
                request.getSymptoms()
        );

        progress.setObservations(
                request.getObservations()
        );

        progress.setImprovementPercentage(
                request.getImprovementPercentage()
        );

        progress.setTherapyResponse(
                request.getTherapyResponse()
        );

        progress.setPractitionerNotes(
                request.getPractitionerNotes()
        );

        progress.setNextRecommendation(
                request.getNextRecommendation()
        );

        PatientProgress updatedProgress =
                patientProgressRepository.save(progress);

        return patientProgressMapper.toResponse(
                updatedProgress
        );
    }


    @Override
    public void deleteProgress(
            String id) {

        if (!patientProgressRepository
                .existsById(id)) {

            throw new RuntimeException(
                    "Patient progress assessment not found"
            );
        }

        patientProgressRepository.deleteById(id);
    }


    private void validateRequest(
            PatientProgressRequest request) {

        if (!patientRepository
                .existsById(request.getPatientId())) {

            throw new RuntimeException(
                    "Patient not found"
            );
        }

        if (!therapyPlanRepository
                .existsById(request.getTherapyPlanId())) {

            throw new RuntimeException(
                    "Therapy plan not found"
            );
        }

        if (request.getAssessmentDate() == null) {

            throw new RuntimeException(
                    "Assessment date is required"
            );
        }

        if (request.getDayNumber() == null ||
                request.getDayNumber() <= 0) {

            throw new RuntimeException(
                    "Day number must be greater than zero"
            );
        }

        if (request.getImprovementPercentage() != null) {

            if (request.getImprovementPercentage() < 0 ||
                    request.getImprovementPercentage() > 100) {

                throw new RuntimeException(
                        "Improvement percentage must be between 0 and 100"
                );
            }
        }
    }
}