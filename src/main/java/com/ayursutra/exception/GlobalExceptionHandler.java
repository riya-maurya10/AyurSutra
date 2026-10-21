package com.ayursutra.exception;

import com.ayursutra.util.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================
    // HANDLE DEACTIVATED USER ACCOUNT
    // =========================================================

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Object>> handleDisabledAccount(
            DisabledException exception) {

        ApiResponse<Object> response = new ApiResponse<>(
                false,
                "Your account has been deactivated. Please contact the clinic administrator.",
                null
        );

        return new ResponseEntity<>(
                response,
                HttpStatus.FORBIDDEN
        );
    }

    // =========================================================
    // HANDLE VALIDATION / BUSINESS ERRORS
    // =========================================================

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(
            BadRequestException exception) {

        ApiResponse<Object> response = new ApiResponse<>(
                false,
                exception.getMessage(),
                null
        );

        return new ResponseEntity<>(
                response,
                HttpStatus.BAD_REQUEST
        );
    }

    // =========================================================
    // HANDLE ALL OTHER UNEXPECTED ERRORS
    // =========================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(
            Exception exception) {

        ApiResponse<Object> response = new ApiResponse<>(
                false,
                exception.getMessage(),
                null
        );

        return new ResponseEntity<>(
                response,
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}