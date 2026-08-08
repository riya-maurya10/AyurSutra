package com.ayursutra.controller;

import com.ayursutra.dto.request.LoginRequest;
import com.ayursutra.dto.response.LoginResponse;
import com.ayursutra.service.AuthenticationService;
import com.ayursutra.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @RequestBody LoginRequest request) {

        return ApiResponse.success(
                "Login Successful",
                authenticationService.login(request)
        );
    }
}