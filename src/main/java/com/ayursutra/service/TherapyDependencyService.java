package com.ayursutra.service;

import com.ayursutra.dto.request.TherapyDependencyRequest;
import com.ayursutra.dto.response.TherapyDependencyResponse;

import java.util.List;

public interface TherapyDependencyService {

    TherapyDependencyResponse createDependency(
            TherapyDependencyRequest request
    );

    List<TherapyDependencyResponse> getAllDependencies();

    TherapyDependencyResponse getDependencyById(String id);

    List<TherapyDependencyResponse> getDependenciesByTherapy(
            String therapyId
    );

    TherapyDependencyResponse updateDependency(
            String id,
            TherapyDependencyRequest request
    );

    void deleteDependency(String id);
}