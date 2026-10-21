package com.vaeto.crm.service;

import com.vaeto.crm.dto.request.RegisterRequest;
import com.vaeto.crm.dto.response.UserDto;
import com.vaeto.crm.exception.BadRequestException;
import com.vaeto.crm.exception.ResourceNotFoundException;
import com.vaeto.crm.model.User;
import com.vaeto.crm.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    public UserDto getUserById(String id) {
        try {
            return getUserById(Long.parseLong(id));
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Invalid user id: " + id);
        }
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(RegisterRequest request, String actorId, String actorName) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        String rawRole = request.getRoleId() != null ? request.getRoleId() : "user";
        String normalizedRole = rawRole.toLowerCase().replace("role_", "");
        if (!"admin".equals(normalizedRole) && !"user".equals(normalizedRole)) {
            normalizedRole = "user";
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                normalizedRole,
                "active"
        );
        user.setPhone(request.getPhone());
        user.setJobTitle(request.getJobTitle());
        user.setDepartment(request.getDepartment());
        user.setLocation(request.getLocation());

        User saved = userRepository.save(user);
        auditService.log(actorId, actorName, "CREATE_USER", "users", saved.getId(), "Created user: " + saved.getEmail());
        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto updateDto, String actorId, String actorName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (updateDto.getName() != null) user.setName(updateDto.getName());
        if (updateDto.getPhone() != null) user.setPhone(updateDto.getPhone());
        if (updateDto.getJobTitle() != null) user.setJobTitle(updateDto.getJobTitle());
        if (updateDto.getDepartment() != null) user.setDepartment(updateDto.getDepartment());
        if (updateDto.getLocation() != null) user.setLocation(updateDto.getLocation());
        if (updateDto.getBio() != null) user.setBio(updateDto.getBio());
        if (updateDto.getStatus() != null) {
            String status = updateDto.getStatus().toLowerCase();
            user.setStatus(status.contains("active") ? "active" : "disabled");
        }
        if (updateDto.getRoleId() != null) {
            String role = updateDto.getRoleId().toLowerCase().replace("role_", "");
            user.setRoleId("admin".equals(role) ? "admin" : "user");
        }
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        auditService.log(actorId, actorName, "UPDATE_USER", "users", saved.getId(), "Updated user details");
        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUser(String id, UserDto updateDto, String actorId, String actorName) {
        try {
            return updateUser(Long.parseLong(id), updateDto, actorId, actorName);
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Invalid user id: " + id);
        }
    }

    @Transactional
    public void toggleUserStatus(Long id, String actorId, String actorName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String currentStatus = user.getStatus();
        String newStatus = "active".equalsIgnoreCase(currentStatus) ? "disabled" : "active";
        user.setStatus(newStatus);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        auditService.log(actorId, actorName, "TOGGLE_USER_STATUS", "users", user.getId(), "Changed status to: " + newStatus);
    }

    @Transactional
    public void toggleUserStatus(String id, String actorId, String actorName) {
        try {
            toggleUserStatus(Long.parseLong(id), actorId, actorName);
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Invalid user id: " + id);
        }
    }

    public UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        String role = user.getRoleId();
        if (role == null || role.isBlank()) {
            dto.setRoleId("ROLE_USER");
        } else if (!role.toUpperCase().startsWith("ROLE_")) {
            dto.setRoleId("ROLE_" + role.toUpperCase());
        } else {
            dto.setRoleId(role.toUpperCase());
        }
        String status = user.getStatus();
        dto.setStatus("active".equalsIgnoreCase(status) ? "Active" : "Inactive");
        dto.setPhone(user.getPhone());
        dto.setJobTitle(user.getJobTitle());
        dto.setDepartment(user.getDepartment());
        dto.setLocation(user.getLocation());
        dto.setBio(user.getBio());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        return dto;
    }
}
