package com.vaeto.crm.controller;

import com.vaeto.crm.dto.request.ChangePasswordRequest;
import com.vaeto.crm.dto.request.LoginRequest;
import com.vaeto.crm.dto.request.RegisterRequest;
import com.vaeto.crm.dto.response.ApiResponse;
import com.vaeto.crm.dto.response.AuthResponse;
import com.vaeto.crm.dto.response.UserDto;
import com.vaeto.crm.security.UserPrincipal;
import com.vaeto.crm.service.AuthService;
import com.vaeto.crm.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("application", "Vaeto CRM Backend");
        health.put("version", "1.0.0");
        return ResponseEntity.ok(ApiResponse.success(health));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Signed in successfully", response));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<UserDto>> register(
            @Valid @RequestBody RegisterRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "system";
        String actorName = currentUser != null ? currentUser.getName() : "System";
        UserDto created = userService.createUser(request, actorId, actorName);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", created));
    }

    @GetMapping("/auth/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        UserDto userDto = userService.getUserById(currentUser.getId());
        Map<String, Object> response = new HashMap<>();
        response.put("user", userDto);

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));
        Map<String, Object> role = new HashMap<>();
        role.put("isAdmin", isAdmin);
        role.put("name", isAdmin ? "Administrator" : "User");
        response.put("role", role);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/auth/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        authService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String token = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7) : null;
        String userId = currentUser != null ? String.valueOf(currentUser.getId()) : null;
        authService.logout(userId, token);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
