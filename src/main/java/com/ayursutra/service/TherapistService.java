package com.ayursutra.service;

import com.ayursutra.dto.request.TherapistRequest;
import com.ayursutra.dto.response.PatientResponse;
import com.ayursutra.dto.response.TherapistResponse;

import java.util.List;

public interface TherapistService {

    TherapistResponse createTherapist(TherapistRequest request);

    List<TherapistResponse> getAllTherapists();

    TherapistResponse getTherapistById(String id);

    TherapistResponse updateTherapist(String id, TherapistRequest request);

    void deleteTherapist(String id);

    TherapistResponse getMyProfile();

    List<PatientResponse> getMyPatients();
}