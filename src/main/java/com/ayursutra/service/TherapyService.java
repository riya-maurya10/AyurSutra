package com.ayursutra.service;

import com.ayursutra.dto.request.TherapyRequest;
import com.ayursutra.dto.response.TherapyResponse;

import java.util.List;

public interface TherapyService {

    TherapyResponse createTherapy(TherapyRequest request);

    List<TherapyResponse> getAllTherapies();

    TherapyResponse getTherapyById(String id);

    TherapyResponse updateTherapy(
            String id,
            TherapyRequest request
    );

    void deleteTherapy(String id);
}