package com.ayursutra.repository;

import com.ayursutra.entity.Therapist;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TherapistRepository
        extends MongoRepository<Therapist, String> {

    Optional<Therapist> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Therapist> findBySpecializationAndAvailableTrue(
            String specialization
    );
}