package com.ayursutra.mapper;

import com.ayursutra.dto.request.DoctorRequest;
import com.ayursutra.dto.response.DoctorResponse;
import com.ayursutra.entity.Doctor;
import org.springframework.stereotype.Component;

@Component
public class DoctorMapper {

    public Doctor toEntity(DoctorRequest request) {

        Doctor doctor = new Doctor();

        doctor.setUserId(request.getUserId());
        doctor.setFullName(request.getFullName());
        doctor.setEmail(request.getEmail());
        doctor.setPhone(request.getPhone());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setAvailable(request.isAvailable());

        return doctor;
    }

    public DoctorResponse toResponse(Doctor doctor) {

        return new DoctorResponse(
                doctor.getId(),
                doctor.getUserId(),
                doctor.getFullName(),
                doctor.getEmail(),
                doctor.getPhone(),
                doctor.getSpecialization(),
                doctor.getQualification(),
                doctor.getExperienceYears(),
                doctor.getLicenseNumber(),
                doctor.isAvailable()
        );
    }
}