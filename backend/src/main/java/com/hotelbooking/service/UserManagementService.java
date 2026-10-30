
package com.hotelbooking.service;

import com.hotelbooking.dto.UserSummaryResponse;
import com.hotelbooking.dto.UpdateUserRequest;
import com.hotelbooking.model.User;
import com.hotelbooking.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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

        if (keyword == null || keyword.isBlank()) {
            return getAllUsers();
        }

        String search = keyword.trim();

        List<User> users = userRepository
                .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(
                        search,
                        search,
                        search
                );

        return users.stream()
                .map(UserSummaryResponse::fromUser)
                .toList();
    }

    // FR-81: Cap nhat thong tin nguoi dung
    @Transactional
    public Optional<UserSummaryResponse> updateUser(
            Long id, UpdateUserRequest request) {

        // Kiem tra du lieu dau vao
        if (request == null ||
                (request.getName() == null &&
                 request.getPhone() == null)) {
            throw new IllegalArgumentException(
                    "Can cung cap ten hoac so dien thoai");
        }

        // Tim nguoi dung theo ID
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();

        // Cap nhat ho ten neu duoc cung cap
        if (request.getName() != null) {

            String name = request.getName().trim();

            if (name.isEmpty() || name.length() > 150) {
                throw new IllegalArgumentException(
                        "Ten nguoi dung khong hop le");
            }

            user.setName(name);
        }

        // Cap nhat so dien thoai neu duoc cung cap
        if (request.getPhone() != null) {

            String phone = request.getPhone().trim();

            if (phone.isEmpty()
                    || phone.length() > 20
                    || !phone.matches("\\+?[0-9 -]{7,20}")) {
                throw new IllegalArgumentException(
                        "So dien thoai khong hop le");
            }

            user.setPhone(phone);
        }

        // Luu thong tin vao PostgreSQL
        User updatedUser = userRepository.save(user);

        // Khong tra ve mat khau
        return Optional.of(
                UserSummaryResponse.fromUser(updatedUser)
        );
    }

    // FR-82: Khoa hoac mo khoa tai khoan nguoi dung
    @Transactional
    public Optional<UserSummaryResponse> changeUserStatus(
            Long userId, boolean active, Long adminId) {

        // Ngan ADMIN tu khoa tai khoan cua minh
        if (!active && userId.equals(adminId)) {
            throw new IllegalArgumentException(
                    "ADMIN khong the tu khoa tai khoan cua minh");
        }

        // Tim tai khoan can thay doi
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();

        // Cap nhat trang thai tai khoan
        user.setActive(active);

        // Luu vao PostgreSQL
        User savedUser = userRepository.save(user);

        return Optional.of(
                UserSummaryResponse.fromUser(savedUser)
        );
    }
}
