package com.ayursutra.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRequest {

    @NotBlank
    private String userId;

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String specialization;

    @NotBlank
    private String qualification;

    @Min(0)
    private int experienceYears;

    @NotBlank
    private String licenseNumber;

    private boolean available;
}