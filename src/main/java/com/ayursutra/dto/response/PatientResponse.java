package com.ayursutra.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {

    private String id;

    private String userId;

    private String fullName;

    private String email;

    private String phone;

    private Integer age;

    private String gender;

    private String address;

    private String medicalHistory;
}