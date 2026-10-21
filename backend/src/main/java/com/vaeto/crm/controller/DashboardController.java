package com.vaeto.crm.controller;

import com.vaeto.crm.dto.response.ApiResponse;
import com.vaeto.crm.dto.response.DashboardStatsDto;
import com.vaeto.crm.dto.response.FollowUpDto;
import com.vaeto.crm.dto.response.LeadStatusAggregateDto;
import com.vaeto.crm.service.DashboardService;
import com.vaeto.crm.service.FollowUpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final FollowUpService followUpService;

    public DashboardController(DashboardService dashboardService, FollowUpService followUpService) {
        this.dashboardService = dashboardService;
        this.followUpService = followUpService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardStats()));
    }

    @GetMapping("/lead-status")
    public ResponseEntity<ApiResponse<LeadStatusAggregateDto>> getLeadStatus() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getLeadStatusAggregate()));
    }

    @GetMapping("/upcoming-followups")
    public ResponseEntity<ApiResponse<List<FollowUpDto>>> getUpcomingFollowUps() {
        return ResponseEntity.ok(ApiResponse.success(followUpService.getUpcomingFollowUps()));
    }
}
