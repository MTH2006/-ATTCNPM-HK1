
package com.hotelbooking.controller;

import com.hotelbooking.dto.UserSummaryResponse;
import com.hotelbooking.model.User;
import com.hotelbooking.security.AuthTokenService;
import com.hotelbooking.service.UserManagementService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:5173"
})
public class UserManagementController {

    private final UserManagementService userService;
    private final AuthTokenService tokens;

    public UserManagementController(
            UserManagementService userService,
            AuthTokenService tokens) {

        this.userService = userService;
        this.tokens = tokens;
    }

    @GetMapping
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers(
            @RequestHeader(
                value = "Authorization",
                required = false
            ) String authorization) {

        // Kiem tra token dang nhap.
        Optional<User> currentUser =
                tokens.authenticate(authorization);

        // Chua dang nhap, token sai hoac het han.
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        // Chi ADMIN duoc xem danh sach nguoi dung.
        if (!"ADMIN".equals(currentUser.get().getRole())) {
            return ResponseEntity.status(403).build();
        }

        // Lay danh sach user, khong tra passwordHash.
        return ResponseEntity.ok(
            userService.getAllUsers()
        );
    }
}
