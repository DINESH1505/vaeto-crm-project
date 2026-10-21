package com.vaeto.crm.service;

import com.vaeto.crm.dto.request.ChangePasswordRequest;
import com.vaeto.crm.dto.request.LoginRequest;
import com.vaeto.crm.dto.response.AuthResponse;
import com.vaeto.crm.dto.response.UserDto;
import com.vaeto.crm.exception.BadRequestException;
import com.vaeto.crm.exception.UnauthorizedException;
import com.vaeto.crm.model.User;
import com.vaeto.crm.model.UserSession;
import com.vaeto.crm.repository.UserRepository;
import com.vaeto.crm.repository.UserSessionRepository;
import com.vaeto.crm.security.JwtTokenProvider;
import com.vaeto.crm.security.UserPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       UserSessionRepository userSessionRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       UserService userService,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password. Please try again."));

        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            throw new UnauthorizedException("Your account is inactive. Please contact your administrator.");
        }

        // Verify password: support BCrypt and graceful migration from legacy plain-text
        boolean passwordMatches = false;
        if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$") || user.getPassword().startsWith("$2y$")) {
            passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        } else {
            // Legacy / Initial plaintext check -> upgrade to BCrypt immediately
            if (user.getPassword().equals(request.getPassword()) || user.getPassword().equalsIgnoreCase(request.getPassword())) {
                passwordMatches = true;
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }
        }

        if (!passwordMatches) {
            throw new UnauthorizedException("Invalid email or password. Please try again.");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT
        UserPrincipal principal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        // Record session
        try {
            long expiresAtEpoch = (System.currentTimeMillis() / 1000) + 86400;
            String sessionData = "{\"userId\":" + user.getId() + ",\"jwt\":\"" + jwt + "\"}";
            UserSession session = new UserSession(
                    UUID.randomUUID().toString().replace("-", ""),
                    expiresAtEpoch,
                    sessionData
            );
            userSessionRepository.save(session);
        } catch (Exception ignored) {
        }

        // Audit login
        auditService.log(user.getId(), user.getName(), "USER_LOGIN", "users", user.getId(), "User logged in successfully");

        UserDto userDto = userService.mapToDto(user);
        Map<String, Object> roleMap = new HashMap<>();
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(user.getRoleId()) || "admin".equalsIgnoreCase(user.getRoleId());
        roleMap.put("isAdmin", isAdmin);
        roleMap.put("name", isAdmin ? "Administrator" : "User");

        return new AuthResponse(jwt, userDto, roleMap);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        boolean currentMatches = passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())
                || user.getPassword().equals(request.getCurrentPassword());

        if (!currentMatches) {
            throw new BadRequestException("Current password is incorrect.");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password must be different from the current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        auditService.log(user.getId(), user.getName(), "CHANGE_PASSWORD", "users", user.getId(), "User changed password");
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        try {
            changePassword(Long.parseLong(userId), request);
        } catch (NumberFormatException e) {
            throw new BadRequestException("Invalid user id: " + userId);
        }
    }

    @Transactional
    public void logout(String userId, String token) {
        SecurityContextHolder.clearContext();
    }
}
