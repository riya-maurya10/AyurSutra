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
@Document(collection = "therapies")
public class Therapy {

    @Id
    private String id;

    private String name;

    private String stage;

    private String description;

    private Integer durationMinutes;

    private Boolean active;
}