package com.vaeto.crm.controller;

import com.vaeto.crm.dto.request.MeetingRequest;
import com.vaeto.crm.dto.response.ApiResponse;
import com.vaeto.crm.dto.response.MeetingDto;
import com.vaeto.crm.security.UserPrincipal;
import com.vaeto.crm.service.MeetingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MeetingDto>>> getMeetings(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String ownerId
    ) {
        List<MeetingDto> meetings = meetingService.getMeetings(startDate, endDate, ownerId);
        return ResponseEntity.ok(ApiResponse.success(meetings));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MeetingDto>> createMeeting(
            @Valid @RequestBody MeetingRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "system";
        MeetingDto created = meetingService.createMeeting(request, actorId);
        return ResponseEntity.ok(ApiResponse.success("Meeting scheduled successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MeetingDto>> updateMeeting(
            @PathVariable String id,
            @RequestBody MeetingRequest request
    ) {
        MeetingDto updated = meetingService.updateMeeting(id, request);
        return ResponseEntity.ok(ApiResponse.success("Meeting updated successfully", updated));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<MeetingDto>> markComplete(@PathVariable String id) {
        MeetingDto updated = meetingService.markCompleted(id);
        return ResponseEntity.ok(ApiResponse.success("Meeting marked as completed", updated));
    }

    @PatchMapping("/{id}/reopen")
    public ResponseEntity<ApiResponse<MeetingDto>> markScheduled(@PathVariable String id) {
        MeetingDto updated = meetingService.markScheduled(id);
        return ResponseEntity.ok(ApiResponse.success("Meeting marked as scheduled", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMeeting(@PathVariable String id) {
        meetingService.deleteMeeting(id);
        return ResponseEntity.ok(ApiResponse.success("Meeting cancelled and removed", null));
    }
}
