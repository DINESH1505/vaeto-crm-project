package com.vaeto.crm.controller;

import com.vaeto.crm.dto.request.FollowUpRequest;
import com.vaeto.crm.dto.response.ApiResponse;
import com.vaeto.crm.dto.response.FollowUpDto;
import com.vaeto.crm.dto.response.PagedResponse;
import com.vaeto.crm.security.UserPrincipal;
import com.vaeto.crm.service.FollowUpService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/follow-ups")
public class FollowUpController {

    private final FollowUpService followUpService;

    public FollowUpController(FollowUpService followUpService) {
        this.followUpService = followUpService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<FollowUpDto>>> getFollowUps(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String ownerId
    ) {
        PagedResponse<FollowUpDto> response = followUpService.getFollowUps(page, size, ownerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FollowUpDto>> createFollowUp(
            @Valid @RequestBody FollowUpRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "system";
        FollowUpDto created = followUpService.createFollowUp(request, actorId);
        return ResponseEntity.ok(ApiResponse.success("Follow-up scheduled successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FollowUpDto>> updateFollowUp(
            @PathVariable String id,
            @Valid @RequestBody FollowUpRequest request
    ) {
        FollowUpDto updated = followUpService.updateFollowUp(id, request);
        return ResponseEntity.ok(ApiResponse.success("Follow-up updated successfully", updated));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<FollowUpDto>> markComplete(@PathVariable String id) {
        FollowUpDto updated = followUpService.markCompleted(id);
        return ResponseEntity.ok(ApiResponse.success("Follow-up marked as completed", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFollowUp(@PathVariable String id) {
        followUpService.deleteFollowUp(id);
        return ResponseEntity.ok(ApiResponse.success("Follow-up deleted successfully", null));
    }
}
