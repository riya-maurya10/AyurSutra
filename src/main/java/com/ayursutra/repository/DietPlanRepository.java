package com.ayursutra.repository;

import com.ayursutra.entity.DietPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DietPlanRepository
        extends MongoRepository<DietPlan, String> {

    List<DietPlan> findByPatientId(String patientId);

    List<DietPlan> findByTherapyPlanId(String therapyPlanId);

    List<DietPlan> findByDoctorId(String doctorId);
}