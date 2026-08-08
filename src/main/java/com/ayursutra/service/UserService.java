package com.ayursutra.service;

import com.ayursutra.dto.request.RegisterUserRequest;
import com.ayursutra.dto.response.UserResponse;

public interface UserService {

    UserResponse register(RegisterUserRequest request);

}