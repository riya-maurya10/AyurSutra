package com.ayursutra.service.impl;

import com.ayursutra.dto.request.RegisterUserRequest;
import com.ayursutra.dto.response.UserResponse;
import com.ayursutra.entity.User;
import com.ayursutra.mapper.UserMapper;
import com.ayursutra.repository.UserRepository;
import com.ayursutra.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           UserMapper userMapper,
                           PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse register(RegisterUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setEnabled(true);

        userRepository.save(user);

        return UserMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    @Override
    public UserResponse deactivateUser(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setEnabled(false);

        userRepository.save(user);

        return UserMapper.toResponse(user);
    }

    @Override
    public UserResponse activateUser(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setEnabled(true);

        userRepository.save(user);

        return UserMapper.toResponse(user);
    }
}