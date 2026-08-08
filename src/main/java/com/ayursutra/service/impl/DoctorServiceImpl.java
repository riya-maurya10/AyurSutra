package com.ayursutra.service.impl;

import com.ayursutra.dto.request.DoctorRequest;
import com.ayursutra.dto.response.DoctorResponse;
import com.ayursutra.entity.Doctor;
import com.ayursutra.mapper.DoctorMapper;
import com.ayursutra.repository.DoctorRepository;
import com.ayursutra.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorMapper doctorMapper;

    @Override
    public DoctorResponse createDoctor(DoctorRequest request) {

        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new RuntimeException("Doctor with this license number already exists");
        }

        Doctor doctor = doctorMapper.toEntity(request);

        Doctor savedDoctor = doctorRepository.save(doctor);

        return doctorMapper.toResponse(savedDoctor);
    }

    @Override
    public List<DoctorResponse> getAllDoctors() {

        return doctorRepository.findAll()
                .stream()
                .map(doctorMapper::toResponse)
                .toList();
    }

    @Override
    public DoctorResponse getDoctorById(String id) {

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        return doctorMapper.toResponse(doctor);
    }

    @Override
    public DoctorResponse updateDoctor(
            String id,
            DoctorRequest request) {

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        doctor.setUserId(request.getUserId());
        doctor.setFullName(request.getFullName());
        doctor.setEmail(request.getEmail());
        doctor.setPhone(request.getPhone());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setAvailable(request.isAvailable());

        Doctor updatedDoctor = doctorRepository.save(doctor);

        return doctorMapper.toResponse(updatedDoctor);
    }

    @Override
    public void deleteDoctor(String id) {

        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found");
        }

        doctorRepository.deleteById(id);
    }
}