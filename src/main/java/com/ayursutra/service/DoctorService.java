package com.ayursutra.service;

import com.ayursutra.dto.request.DoctorRequest;
import com.ayursutra.dto.response.DoctorResponse;

import java.util.List;

public interface DoctorService {

    DoctorResponse createDoctor(DoctorRequest request);

    List<DoctorResponse> getAllDoctors();

    DoctorResponse getDoctorById(String id);

    DoctorResponse updateDoctor(String id, DoctorRequest request);

    void deleteDoctor(String id);
}