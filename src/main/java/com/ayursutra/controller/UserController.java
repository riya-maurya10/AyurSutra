package com.ayursutra.controller;

import com.ayursutra.dto.request.RegisterUserRequest;
import com.ayursutra.dto.response.UserResponse;
import com.ayursutra.service.UserService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(
            @Valid @RequestBody RegisterUserRequest request){

        return new ApiResponse<>(
                true,
                "User Registered Successfully",
                userService.register(request)
        );

    }

    @GetMapping("/test")
    public ApiResponse<String> test() {

        return new ApiResponse<>(
                true,
                "JWT Authentication Working",
                "You are authenticated"
        );
    }

}