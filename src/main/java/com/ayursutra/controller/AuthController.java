package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.LoginRequest;
import com.ayursutra.dto.request.RegisterUserRequest;
import com.ayursutra.dto.response.LoginResponse;
import com.ayursutra.dto.response.UserResponse;
import com.ayursutra.service.AuditService;
import com.ayursutra.service.AuthenticationService;
import com.ayursutra.service.UserService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final AuditService auditService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @RequestBody LoginRequest request) {

        LoginResponse response =
                authenticationService.login(request);

        auditService.log(
                AuditAction.LOGIN,
                "User",
                null,
                request.getEmail(),
                "User " + request.getEmail() + " logged in"
        );

        return ApiResponse.success(
                "Login Successful",
                response
        );
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(
            @Valid @RequestBody RegisterUserRequest request) {

        UserResponse response =
                userService.register(request);

        auditService.log(
                AuditAction.CREATE,
                "User",
                response.getId(),
                response.getFullName(),
                "User " + response.getFullName() + " registered"
        );

        return ApiResponse.success(
                "Registration Successful",
                response
        );
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> logout() {

        auditService.log(
                AuditAction.LOGOUT,
                "User",
                null,
                null,
                "User logged out"
        );

        return ApiResponse.success(
                "Logout Successful",
                "User logged out successfully"
        );
    }
}