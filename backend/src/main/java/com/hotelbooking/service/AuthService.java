
package com.hotelbooking.service;

import com.hotelbooking.dto.AuthRequest;
import com.hotelbooking.dto.AuthResponse;
import com.hotelbooking.model.User;
import com.hotelbooking.repository.UserRepository;
import com.hotelbooking.security.AuthTokenService;
import com.hotelbooking.security.PasswordService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuthTokenService tokens;
    private final PasswordService passwords;

    public AuthService(
            UserRepository userRepository,
            AuthTokenService tokens,
            PasswordService passwords) {

        this.userRepository = userRepository;
        this.tokens = tokens;
        this.passwords = passwords;
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {

        if (request == null
                || request.getEmail() == null
                || request.getPassword() == null
                || request.getPassword().isBlank()) {
            return denied();
        }

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        Optional<User> found =
                userRepository.findByEmail(email);

        if (found.isEmpty()) {
            return denied();
        }

        User user = found.get();
       
        // FR-82: Chan tai khoan da bi khoa dang nhap
        if (!user.isActive()) {
            return denied();
        }

        if (!passwords.matches(
                request.getPassword(),
                user.getPasswordHash())) {
            return denied();
        }

        if (passwords.needsUpgrade(user.getPasswordHash())) {
            user.setPasswordHash(
                passwords.hash(request.getPassword())
            );
            userRepository.save(user);
        }

        return granted(user);
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {

        if (request == null
                || request.getEmail() == null
                || request.getPassword() == null
                || request.getPassword().length() < 8) {
            return denied();
        }

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
                || userRepository.existsByEmail(email)) {
            return denied();
        }

        String name = request.getName();

        if (name == null || name.isBlank()) {
            name = email.substring(0, email.indexOf('@'));
        }

        String uuid = "usr_"
                + UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 16);

        User user = new User(
            uuid,
            name.trim(),
            email,
            passwords.hash(request.getPassword()),
            null,
            "USER"
        );

        userRepository.save(user);

        return granted(user);
    }

    private AuthResponse granted(User user) {

        AuthResponse.UserDto dto =
            new AuthResponse.UserDto(
                user.getUserUuid(),
                user.getName(),
                user.getEmail()
            );

        return new AuthResponse(
            true,
            tokens.issue(user),
            dto
        );
    }

    private AuthResponse denied() {
        return new AuthResponse(false, null, null);
    }
}
