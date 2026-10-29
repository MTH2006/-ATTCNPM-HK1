package com.hotelbooking.service;

import com.hotelbooking.dto.AuthRequest;
import com.hotelbooking.dto.AuthResponse;
import com.hotelbooking.model.User;
import com.hotelbooking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().toLowerCase().trim());
        if (userOpt.isEmpty()) {
            // Auto register on first mock login or throw error
            return register(request);
        }
        User user = userOpt.get();
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            String inputHash = hashPassword(request.getPassword());
            if (!inputHash.equals(user.getPasswordHash())) {
                return new AuthResponse(false, null, null);
            }
        }
        String token = "jwt_" + UUID.randomUUID().toString();
        AuthResponse.UserDto userDto = new AuthResponse.UserDto(user.getUserUuid(), user.getName(), user.getEmail());
        return new AuthResponse(true, token, userDto);
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User u = existing.get();
            String token = "jwt_" + UUID.randomUUID().toString();
            AuthResponse.UserDto userDto = new AuthResponse.UserDto(u.getUserUuid(), u.getName(), u.getEmail());
            return new AuthResponse(true, token, userDto);
        }

        String name = request.getName();
        if (name == null || name.trim().isEmpty()) {
            name = email.split("@")[0];
        }

        String password = (request.getPassword() != null && !request.getPassword().isEmpty()) 
                ? request.getPassword() 
                : "DefaultPass@2025";
        String passwordHash = hashPassword(password);
        String uuid = "usr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        User newUser = new User(uuid, name, email, passwordHash, null, "USER");
        userRepository.save(newUser);

        String token = "jwt_" + UUID.randomUUID().toString();
        AuthResponse.UserDto userDto = new AuthResponse.UserDto(uuid, name, email);
        return new AuthResponse(true, token, userDto);
    }
}
