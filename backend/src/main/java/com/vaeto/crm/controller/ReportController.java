package com.vaeto.crm.controller;

import com.vaeto.crm.dto.response.ApiResponse;
import com.vaeto.crm.repository.FollowUpRepository;
import com.vaeto.crm.repository.LeadRepository;
import com.vaeto.crm.repository.MeetingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final LeadRepository leadRepository;
    private final FollowUpRepository followUpRepository;
    private final MeetingRepository meetingRepository;

    public ReportController(LeadRepository leadRepository, FollowUpRepository followUpRepository, MeetingRepository meetingRepository) {
        this.leadRepository = leadRepository;
        this.followUpRepository = followUpRepository;
        this.meetingRepository = meetingRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports() {
        Map<String, Object> reports = new HashMap<>();
        reports.put("totalLeads", leadRepository.count());
        reports.put("scheduledLeads", leadRepository.countByStatus("Scheduled"));
        reports.put("completedLeads", leadRepository.countByStatus("Completed"));
        reports.put("pendingFollowUps", followUpRepository.countByStatus("Pending"));
        reports.put("completedMeetings", meetingRepository.countByStatus("Completed"));

        return ResponseEntity.ok(ApiResponse.success(reports));
    }
}
