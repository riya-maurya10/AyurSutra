package com.ayursutra.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapistResponse {

    private String id;

    private String userId;

    private String fullName;

    private String email;

    private String phone;

    private String specialization;

    private String qualification;

    private int experienceYears;

    private String therapistType;

    private boolean available;
}