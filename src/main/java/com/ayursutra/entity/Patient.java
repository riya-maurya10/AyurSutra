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
@Document(collection = "patients")
public class Patient extends BaseEntity {

    private String fullName;

    private String email;

    private String phone;

    private Integer age;

    private String gender;

    private String address;

    private String medicalHistory;
}