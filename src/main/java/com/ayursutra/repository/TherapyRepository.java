package com.ayursutra.repository;

import com.ayursutra.entity.Therapy;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TherapyRepository
        extends MongoRepository<Therapy, String> {

    boolean existsByName(String name);
}