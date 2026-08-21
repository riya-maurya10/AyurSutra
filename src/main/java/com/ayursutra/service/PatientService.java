package com.ayursutra.service;

import com.ayursutra.dto.request.CreatePatientRequest;
import com.ayursutra.dto.request.UpdatePatientRequest;
import com.ayursutra.dto.response.PatientResponse;

import java.util.List;

public interface PatientService {

    PatientResponse createPatient(CreatePatientRequest request);

    List<PatientResponse> getAllPatients();

    PatientResponse getPatientById(String id);

    PatientResponse updatePatient(
            String id,
            UpdatePatientRequest request
    );

    void deletePatient(String id);

    PatientResponse createMyProfile(UpdatePatientRequest request);

    PatientResponse getMyProfile();

    PatientResponse updateMyProfile(UpdatePatientRequest request);
}