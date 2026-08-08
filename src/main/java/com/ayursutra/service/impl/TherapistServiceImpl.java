package com.ayursutra.service.impl;

import com.ayursutra.dto.request.TherapistRequest;
import com.ayursutra.dto.response.TherapistResponse;
import com.ayursutra.entity.Therapist;
import com.ayursutra.mapper.TherapistMapper;
import com.ayursutra.repository.TherapistRepository;
import com.ayursutra.service.TherapistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TherapistServiceImpl implements TherapistService {

    private final TherapistRepository therapistRepository;
    private final TherapistMapper therapistMapper;

    @Override
    public TherapistResponse createTherapist(
            TherapistRequest request) {

        if (therapistRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Therapist with this email already exists"
            );
        }

        Therapist therapist =
                therapistMapper.toEntity(request);

        Therapist savedTherapist =
                therapistRepository.save(therapist);

        return therapistMapper.toResponse(savedTherapist);
    }

    @Override
    public List<TherapistResponse> getAllTherapists() {

        return therapistRepository.findAll()
                .stream()
                .map(therapistMapper::toResponse)
                .toList();
    }

    @Override
    public TherapistResponse getTherapistById(String id) {

        Therapist therapist =
                therapistRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapist not found"
                                ));

        return therapistMapper.toResponse(therapist);
    }

    @Override
    public TherapistResponse updateTherapist(
            String id,
            TherapistRequest request) {

        Therapist therapist =
                therapistRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapist not found"
                                ));

        therapist.setUserId(request.getUserId());
        therapist.setFullName(request.getFullName());
        therapist.setEmail(request.getEmail());
        therapist.setPhone(request.getPhone());
        therapist.setSpecialization(request.getSpecialization());
        therapist.setQualification(request.getQualification());
        therapist.setExperienceYears(
                request.getExperienceYears()
        );
        therapist.setTherapistType(
                request.getTherapistType()
        );
        therapist.setAvailable(request.isAvailable());

        Therapist updatedTherapist =
                therapistRepository.save(therapist);

        return therapistMapper.toResponse(updatedTherapist);
    }

    @Override
    public void deleteTherapist(String id) {

        if (!therapistRepository.existsById(id)) {
            throw new RuntimeException(
                    "Therapist not found"
            );
        }

        therapistRepository.deleteById(id);
    }
}