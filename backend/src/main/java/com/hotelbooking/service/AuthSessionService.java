package com.hotelbooking.service;

import com.hotelbooking.model.User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthSessionService {
    private final Map<String, UserSession> sessions = new ConcurrentHashMap<>();

    public String create(User user) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, new UserSession(user.getUserUuid(), user.getRole(), Instant.now().plus(Duration.ofHours(8))));
        return token;
    }

    public boolean isAdmin(String authorization) {
        UserSession session = find(authorization);
        return session != null && "ADMIN".equalsIgnoreCase(session.role());
    }

    public boolean isAuthenticated(String authorization) {
        return find(authorization) != null;
    }

    public String userId(String authorization) {
        UserSession session = find(authorization);
        return session == null ? null : session.userId();
    }

    private UserSession find(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        String token = authorization.substring(7).trim();
        UserSession session = sessions.get(token);
        if (session != null && session.expiresAt().isBefore(Instant.now())) {
            sessions.remove(token);
            return null;
        }
        return session;
    }

    private record UserSession(String userId, String role, Instant expiresAt) {}
}
