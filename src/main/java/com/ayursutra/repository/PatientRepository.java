package com.ayursutra.repository;

import com.ayursutra.entity.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PatientRepository extends MongoRepository<Patient, String> {

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}