
package com.hotelbooking.service;

import com.hotelbooking.dto.UserSummaryResponse;
import com.hotelbooking.model.User;
import com.hotelbooking.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserManagementService {

    private final UserRepository userRepository;

    public UserManagementService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // FR-79: Lay danh sach tat ca nguoi dung
    public List<UserSummaryResponse> getAllUsers() {

        List<User> users = userRepository.findAll();

        return users.stream()
                .map(UserSummaryResponse::fromUser)
                .toList();
    }

    // FR-80: Tim kiem nguoi dung
    public List<UserSummaryResponse> searchUsers(String keyword) {

        // Neu tu khoa rong, tra ve tat ca nguoi dung
        if (keyword == null || keyword.isBlank()) {
            return getAllUsers();
        }

        String search = keyword.trim();

        // Tim theo ten, email hoac so dien thoai
        List<User> users = userRepository
                .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(
                        search,
                        search,
                        search
                );

        // Chuyen sang DTO de khong tra ve passwordHash
        return users.stream()
                .map(UserSummaryResponse::fromUser)
                .toList();
    }
}
