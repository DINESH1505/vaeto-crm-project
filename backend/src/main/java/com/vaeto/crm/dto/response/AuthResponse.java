package com.vaeto.crm.dto.response;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private UserDto user;
    private Object role;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserDto user, Object role) {
        this.token = token;
        this.user = user;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public Object getRole() {
        return role;
    }

    public void setRole(Object role) {
        this.role = role;
    }
}
