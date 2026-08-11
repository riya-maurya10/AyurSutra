package com.ayursutra.service.impl;

import com.ayursutra.dto.request.TherapyDependencyRequest;
import com.ayursutra.dto.response.TherapyDependencyResponse;
import com.ayursutra.entity.TherapyDependency;
import com.ayursutra.mapper.TherapyDependencyMapper;
import com.ayursutra.repository.TherapyDependencyRepository;
import com.ayursutra.repository.TherapyRepository;
import com.ayursutra.service.TherapyDependencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TherapyDependencyServiceImpl
        implements TherapyDependencyService {

    private final TherapyDependencyRepository dependencyRepository;
    private final TherapyRepository therapyRepository;
    private final TherapyDependencyMapper dependencyMapper;

    @Override
    public TherapyDependencyResponse createDependency(
            TherapyDependencyRequest request) {

        validateTherapies(request.getTherapyId(),
                request.getRelatedTherapyId());

        if (request.getTherapyId()
                .equals(request.getRelatedTherapyId())) {

            throw new IllegalArgumentException(
                    "A therapy cannot have a dependency on itself"
            );
        }

        if (dependencyRepository
                .existsByTherapyIdAndRelatedTherapyId(
                        request.getTherapyId(),
                        request.getRelatedTherapyId())) {

            throw new IllegalArgumentException(
                    "This therapy dependency already exists"
            );
        }

        TherapyDependency dependency =
                dependencyMapper.toEntity(request);

        TherapyDependency saved =
                dependencyRepository.save(dependency);

        return dependencyMapper.toResponse(saved);
    }

    @Override
    public List<TherapyDependencyResponse> getAllDependencies() {

        return dependencyRepository.findAll()
                .stream()
                .map(dependencyMapper::toResponse)
                .toList();
    }

    @Override
    public TherapyDependencyResponse getDependencyById(String id) {

        TherapyDependency dependency =
                dependencyRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Therapy dependency not found"
                                ));

        return dependencyMapper.toResponse(dependency);
    }

    @Override
    public List<TherapyDependencyResponse> getDependenciesByTherapy(
            String therapyId) {

        if (!therapyRepository.existsById(therapyId)) {
            throw new IllegalArgumentException(
                    "Therapy not found with ID: " + therapyId
            );
        }

        return dependencyRepository
                .findByTherapyId(therapyId)
                .stream()
                .map(dependencyMapper::toResponse)
                .toList();
    }

    @Override
    public TherapyDependencyResponse updateDependency(
            String id,
            TherapyDependencyRequest request) {

        TherapyDependency dependency =
                dependencyRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Therapy dependency not found"
                                ));

        validateTherapies(
                request.getTherapyId(),
                request.getRelatedTherapyId()
        );

        if (request.getTherapyId()
                .equals(request.getRelatedTherapyId())) {

            throw new IllegalArgumentException(
                    "A therapy cannot have a dependency on itself"
            );
        }

        dependencyMapper.updateEntity(dependency, request);

        TherapyDependency updated =
                dependencyRepository.save(dependency);

        return dependencyMapper.toResponse(updated);
    }

    @Override
    public void deleteDependency(String id) {

        if (!dependencyRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Therapy dependency not found"
            );
        }

        dependencyRepository.deleteById(id);
    }

    private void validateTherapies(
            String therapyId,
            String relatedTherapyId) {

        if (!therapyRepository.existsById(therapyId)) {
            throw new IllegalArgumentException(
                    "Therapy not found with ID: " + therapyId
            );
        }

        if (!therapyRepository.existsById(relatedTherapyId)) {
            throw new IllegalArgumentException(
                    "Related therapy not found with ID: "
                            + relatedTherapyId
            );
        }
    }
}