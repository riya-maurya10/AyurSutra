package com.ayursutra.service.impl;

import com.ayursutra.dto.request.CreatePatientRequest;
import com.ayursutra.dto.request.UpdatePatientRequest;
import com.ayursutra.dto.response.PatientResponse;
import com.ayursutra.entity.Patient;
import com.ayursutra.mapper.PatientMapper;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.security.UserPrincipal;
import com.ayursutra.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Override
    public PatientResponse createPatient(CreatePatientRequest request) {

        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Patient with this email already exists"
            );
        }

        if (patientRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException(
                    "Patient with this phone already exists"
            );
        }

        Patient patient = patientMapper.toEntity(request);

        Patient savedPatient = patientRepository.save(patient);

        return patientMapper.toResponse(savedPatient);
    }

    @Override
    public List<PatientResponse> getAllPatients() {

        return patientRepository.findAll()
                .stream()
                .map(patientMapper::toResponse)
                .toList();
    }

    @Override
    public PatientResponse getPatientById(String id) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        String loggedInUserId = principal.getUser().getId();

        // PATIENT can only access their own profile
        if (principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {

            if (!patient.getUserId().equals(loggedInUserId)) {
                throw new RuntimeException("Access Denied");
            }
        }

        return patientMapper.toResponse(patient);
    }

    @Override
    public PatientResponse updatePatient(
            String id,
            UpdatePatientRequest request) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        patientMapper.updateEntity(patient, request);

        Patient updatedPatient =
                patientRepository.save(patient);

        return patientMapper.toResponse(updatedPatient);
    }

    @Override
    public void deletePatient(String id) {

        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Patient not found");
        }

        patientRepository.deleteById(id);
    }

    @Override
    public PatientResponse getMyProfile() {

        String userId = getLoggedInUserId();

        System.out.println("LOGGED IN USER ID = " + userId);

        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient profile not found"
                        ));

        return patientMapper.toResponse(patient);
    }

    @Override
    public PatientResponse updateMyProfile(
            UpdatePatientRequest request) {

        String userId = getLoggedInUserId();

        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient profile not found"
                        ));

        patientMapper.updateEntity(patient, request);

        Patient updatedPatient =
                patientRepository.save(patient);

        return patientMapper.toResponse(updatedPatient);
    }

    private String getLoggedInUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        return principal.getUser().getId();
    }
}