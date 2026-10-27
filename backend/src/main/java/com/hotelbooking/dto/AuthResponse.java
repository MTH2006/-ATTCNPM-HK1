package com.hotelbooking.dto;

public class AuthResponse {
    private boolean success;
    private String token;
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(boolean success, String token, UserDto user) {
        this.success = success;
        this.token = token;
        this.user = user;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public static class UserDto {
        private String id;
        private String name;
        private String email;

        public UserDto(String id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }

        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
    }
}
