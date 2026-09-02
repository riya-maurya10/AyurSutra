package com.ayursutra.repository;

import com.ayursutra.entity.TherapyPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TherapyPlanRepository
        extends MongoRepository<TherapyPlan, String> {
    List<TherapyPlan> findByPatientId(String patientId);
    List<TherapyPlan> findByDoctorId(String doctorId);
}