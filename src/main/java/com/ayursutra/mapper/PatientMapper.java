package com.ayursutra.mapper;

import com.ayursutra.dto.request.CreatePatientRequest;
import com.ayursutra.dto.request.UpdatePatientRequest;
import com.ayursutra.dto.response.PatientResponse;
import com.ayursutra.entity.Patient;
import org.springframework.stereotype.Component;

@Component
public class PatientMapper {

    public Patient toEntity(CreatePatientRequest request) {

        Patient patient = new Patient();

        patient.setUserId(request.getUserId());
        patient.setFullName(request.getFullName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setMedicalHistory(request.getMedicalHistory());

        return patient;
    }

    public PatientResponse toResponse(Patient patient) {

        return new PatientResponse(
                patient.getId(),
                patient.getUserId(),
                patient.getFullName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getAge(),
                patient.getGender(),
                patient.getAddress(),
                patient.getMedicalHistory()
        );
    }

    public void updateEntity(
            Patient patient,
            UpdatePatientRequest request) {

        if (request.getFullName() != null)
            patient.setFullName(request.getFullName());

        if (request.getEmail() != null)
            patient.setEmail(request.getEmail());

        if (request.getPhone() != null)
            patient.setPhone(request.getPhone());

        if (request.getAge() != null)
            patient.setAge(request.getAge());

        if (request.getGender() != null)
            patient.setGender(request.getGender());

        if (request.getAddress() != null)
            patient.setAddress(request.getAddress());

        if (request.getMedicalHistory() != null)
            patient.setMedicalHistory(request.getMedicalHistory());
    }
}