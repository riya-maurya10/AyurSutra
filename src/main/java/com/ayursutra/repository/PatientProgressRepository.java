package com.ayursutra.repository;

import com.ayursutra.entity.PatientProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PatientProgressRepository
        extends MongoRepository<PatientProgress, String> {

    List<PatientProgress> findByPatientId(
            String patientId
    );

    List<PatientProgress> findByTherapyPlanId(
            String therapyPlanId
    );

    List<PatientProgress>
    findByPatientIdAndTherapyPlanId(
            String patientId,
            String therapyPlanId
    );
}