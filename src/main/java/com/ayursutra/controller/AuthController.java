package com.ayursutra.controller;

import com.ayursutra.dto.request.LoginRequest;
import com.ayursutra.dto.request.RegisterUserRequest;
import com.ayursutra.dto.response.LoginResponse;
import com.ayursutra.dto.response.UserResponse;
import com.ayursutra.service.AuthenticationService;
import com.ayursutra.service.UserService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserService userService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @RequestBody LoginRequest request) {

        return ApiResponse.success(
                "Login Successful",
                authenticationService.login(request)
        );
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(
            @Valid @RequestBody RegisterUserRequest request) {

        return ApiResponse.success(
                "Registration Successful",
                userService.register(request)
        );
    }
}