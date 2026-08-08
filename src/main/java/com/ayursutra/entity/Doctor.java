package com.ayursutra.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "doctors")
public class Doctor extends BaseEntity {

    private String userId;

    private String fullName;

    private String email;

    private String phone;

    private String specialization;

    private String qualification;

    private int experienceYears;

    private String licenseNumber;

    private boolean available;
}