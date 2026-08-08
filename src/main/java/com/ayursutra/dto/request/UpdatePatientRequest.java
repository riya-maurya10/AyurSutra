package com.ayursutra.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientRequest {

    private String fullName;

    private String email;

    private String phone;

    private Integer age;

    private String gender;

    private String address;

    private String medicalHistory;
}