package com.ayursutra.dto.response;

import com.ayursutra.constant.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserResponse {

    private String id;

    private String fullName;

    private String email;

    private String phone;

    private Role role;

    private boolean enabled;
}