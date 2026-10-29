
package com.hotelbooking.controller;

import com.hotelbooking.dto.UserSummaryResponse;
import com.hotelbooking.service.UserManagementService;
import com.hotelbooking.model.User;
import com.hotelbooking.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    private final UserManagementService userService;
    private final UserRepository userRepository;

    public UserManagementController(
            UserManagementService userService,
            UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers(
            Principal principal) {

        // Kiem tra nguoi dung da dang nhap hay chua
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        // Tim tai khoan tu thong tin xac thuc
        Optional<User> currentUser =
                userRepository.findByEmail(principal.getName());

        if (currentUser.isEmpty()) {
            return ResponseEntity.status(403).build();
        }

        // Chi ADMIN moi duoc xem danh sach tai khoan
        if (!"ADMIN".equals(currentUser.get().getRole())) {
            return ResponseEntity.status(403).build();
        }

        // Lay danh sach nguoi dung tu Service
        List<UserSummaryResponse> users =
                userService.getAllUsers();

        // Tra ve danh sach tai khoan
        return ResponseEntity.ok(users);
    }
}
