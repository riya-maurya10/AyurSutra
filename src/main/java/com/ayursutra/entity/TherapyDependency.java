package com.ayursutra.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "therapy_dependencies")
public class TherapyDependency {

    @Id
    private String id;

    private String therapyId;

    private String relatedTherapyId;

    private DependencyType dependencyType;

    private Integer minimumGapMinutes;

    private String description;

    private Boolean active;

    public enum DependencyType {
        BEFORE,
        AFTER,
        REQUIRES,
        CONFLICTS,
        MIN_GAP
    }
}