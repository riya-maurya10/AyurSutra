package com.ayursutra.service;

import com.ayursutra.dto.request.LoginRequest;
import com.ayursutra.dto.request.RegisterUserRequest;
import com.ayursutra.dto.response.LoginResponse;

public interface AuthenticationService {

    LoginResponse login(LoginRequest request);

}