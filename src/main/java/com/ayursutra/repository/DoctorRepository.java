package com.ayursutra.repository;

import com.ayursutra.entity.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DoctorRepository extends MongoRepository<Doctor, String> {

    Optional<Doctor> findByEmail(String email);

    Optional<Doctor> findByUserId(String userId);

    boolean existsByLicenseNumber(String licenseNumber);
}