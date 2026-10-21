package com.vaeto.crm.controller;

import com.vaeto.crm.dto.request.RegisterRequest;
import com.vaeto.crm.dto.response.ApiResponse;
import com.vaeto.crm.dto.response.UserDto;
import com.vaeto.crm.model.AuditLog;
import com.vaeto.crm.repository.AuditLogRepository;
import com.vaeto.crm.security.UserPrincipal;
import com.vaeto.crm.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final AuditLogRepository auditLogRepository;

    public AdminUserController(UserService userService, AuditLogRepository auditLogRepository) {
        this.userService = userService;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @Valid @RequestBody RegisterRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "system";
        String actorName = currentUser != null ? currentUser.getName() : "Administrator";
        UserDto created = userService.createUser(request, actorId, actorName);
        return ResponseEntity.ok(ApiResponse.success("User created successfully by admin", created));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable String id,
            @RequestBody UserDto updateDto,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "system";
        String actorName = currentUser != null ? currentUser.getName() : "Administrator";
        UserDto updated = userService.updateUser(id, updateDto, actorId, actorName);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "system";
        String actorName = currentUser != null ? currentUser.getName() : "Administrator";
        userService.toggleUserStatus(id, actorId, actorName);
        return ResponseEntity.ok(ApiResponse.success("User status changed", null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditLogRepository.findTop20ByOrderByCreatedAtDesc()));
    }
}
