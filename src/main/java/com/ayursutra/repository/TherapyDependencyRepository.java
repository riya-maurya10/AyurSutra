package com.ayursutra.repository;

import com.ayursutra.entity.TherapyDependency;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TherapyDependencyRepository
        extends MongoRepository<TherapyDependency, String> {

    List<TherapyDependency> findByTherapyId(String therapyId);

    List<TherapyDependency> findByRelatedTherapyId(String relatedTherapyId);

    List<TherapyDependency> findByTherapyIdAndActiveTrue(String therapyId);

    boolean existsByTherapyIdAndRelatedTherapyId(
            String therapyId,
            String relatedTherapyId
    );
}