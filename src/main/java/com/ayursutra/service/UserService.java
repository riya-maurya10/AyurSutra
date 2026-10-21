package com.ayursutra.service;

import com.ayursutra.dto.request.RegisterUserRequest;
import com.ayursutra.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse register(RegisterUserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse deactivateUser(String userId);

    UserResponse activateUser(String userId);
}