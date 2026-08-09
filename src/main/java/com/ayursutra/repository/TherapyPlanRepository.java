package com.ayursutra.repository;

import com.ayursutra.entity.TherapyPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TherapyPlanRepository
        extends MongoRepository<TherapyPlan, String> {
}