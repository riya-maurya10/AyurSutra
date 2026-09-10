package com.ayursutra.service.impl;

import com.ayursutra.dto.request.TherapistRequest;
import com.ayursutra.dto.response.PatientResponse;
import com.ayursutra.dto.response.TherapistResponse;
import com.ayursutra.entity.Therapist;
import com.ayursutra.entity.TherapySession;
import com.ayursutra.entity.User;
import com.ayursutra.mapper.TherapistMapper;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.repository.TherapistRepository;
import com.ayursutra.repository.TherapySessionRepository;
import com.ayursutra.security.UserPrincipal;
import com.ayursutra.service.TherapistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TherapistServiceImpl implements TherapistService {

    private final TherapistRepository therapistRepository;
    private final TherapistMapper therapistMapper;
    private final TherapySessionRepository therapySessionRepository;
    private final PatientRepository patientRepository;

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
    public TherapistResponse getMyProfile() {

        UserPrincipal principal =
                (UserPrincipal)
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getPrincipal();

        User user = principal.getUser();

        String userId = user.getId();

        Therapist therapist =
                therapistRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapist profile not found"
                                ));

        return therapistMapper.toResponse(therapist);
    }

    @Override
    public List<PatientResponse> getMyPatients() {

        UserPrincipal principal =
                (UserPrincipal)
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getPrincipal();

        User user = principal.getUser();

        String userId = user.getId();

        Therapist therapist =
                therapistRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapist profile not found"
                                ));

        String therapistId = therapist.getId();

        List<TherapySession> sessions =
                therapySessionRepository.findByTherapistId(therapistId);

        List<String> patientIds =
                sessions.stream()
                        .map(TherapySession::getPatientId)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList();

        return patientIds.stream()
                .map(patientRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(patient -> new PatientResponse(
                        patient.getId(),
                        patient.getUserId(),
                        patient.getFullName(),
                        patient.getEmail(),
                        patient.getPhone(),
                        patient.getAge(),
                        patient.getGender(),
                        patient.getAddress(),
                        patient.getMedicalHistory()
                ))
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

        UserPrincipal principal =
                (UserPrincipal)
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getPrincipal();

        User user = principal.getUser();

        boolean isTherapist =
                user.getRole() != null &&
                        user.getRole().name().equals("THERAPIST");

        if (isTherapist &&
                !user.getId().equals(therapist.getUserId())) {

            throw new RuntimeException(
                    "You are not allowed to update this therapist profile"
            );
        }

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