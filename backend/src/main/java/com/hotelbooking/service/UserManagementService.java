
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

    public List<UserSummaryResponse> getAllUsers() {

        List<User> users = userRepository.findAll();

        return users.stream()
                .map(UserSummaryResponse::fromUser)
                .toList();
    }
}
