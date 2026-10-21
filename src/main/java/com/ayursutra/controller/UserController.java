package com.ayursutra.controller;

import com.ayursutra.constant.AuditAction;
import com.ayursutra.dto.request.RegisterUserRequest;
import com.ayursutra.dto.response.UserResponse;
import com.ayursutra.service.AuditService;
import com.ayursutra.service.UserService;
import com.ayursutra.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuditService auditService;

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
                "User " + response.getFullName() + " created"
        );

        return new ApiResponse<>(
                true,
                "User Registered Successfully",
                response
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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> getAllUsers() {

        return new ApiResponse<>(
                true,
                "Users fetched successfully",
                userService.getAllUsers()
        );
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> deactivateUser(
            @PathVariable String id) {

        UserResponse response =
                userService.deactivateUser(id);

        auditService.log(
                AuditAction.DEACTIVATE,
                "User",
                response.getId(),
                response.getFullName(),
                "User " + response.getFullName() + " deactivated"
        );

        return new ApiResponse<>(
                true,
                "User deactivated successfully",
                response
        );
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> activateUser(
            @PathVariable String id) {

        UserResponse response =
                userService.activateUser(id);

        auditService.log(
                AuditAction.ACTIVATE,
                "User",
                response.getId(),
                response.getFullName(),
                "User " + response.getFullName() + " activated"
        );

        return new ApiResponse<>(
                true,
                "User activated successfully",
                response
        );
    }
}