package com.ayursutra.mapper;

import com.ayursutra.dto.response.UserResponse;
import com.ayursutra.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public static UserResponse toResponse(User user){

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );

    }

}