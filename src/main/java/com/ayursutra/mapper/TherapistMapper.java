package com.ayursutra.mapper;

import com.ayursutra.dto.request.TherapistRequest;
import com.ayursutra.dto.response.TherapistResponse;
import com.ayursutra.entity.Therapist;
import org.springframework.stereotype.Component;

@Component
public class TherapistMapper {

    public Therapist toEntity(TherapistRequest request) {

        Therapist therapist = new Therapist();

        therapist.setUserId(request.getUserId());
        therapist.setFullName(request.getFullName());
        therapist.setEmail(request.getEmail());
        therapist.setPhone(request.getPhone());
        therapist.setSpecialization(request.getSpecialization());
        therapist.setQualification(request.getQualification());
        therapist.setExperienceYears(request.getExperienceYears());
        therapist.setTherapistType(request.getTherapistType());
        therapist.setAvailable(request.isAvailable());

        return therapist;
    }

    public TherapistResponse toResponse(Therapist therapist) {

        return new TherapistResponse(
                therapist.getId(),
                therapist.getUserId(),
                therapist.getFullName(),
                therapist.getEmail(),
                therapist.getPhone(),
                therapist.getSpecialization(),
                therapist.getQualification(),
                therapist.getExperienceYears(),
                therapist.getTherapistType(),
                therapist.isAvailable()
        );
    }
}