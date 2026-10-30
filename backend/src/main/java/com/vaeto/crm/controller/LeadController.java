package com.vaeto.crm.controller;

import com.vaeto.crm.dto.request.BulkImportRequest;
import com.vaeto.crm.dto.request.LeadRequest;
import com.vaeto.crm.dto.response.ApiResponse;
import com.vaeto.crm.dto.response.BulkImportResultDto;
import com.vaeto.crm.dto.response.LeadDto;
import com.vaeto.crm.dto.response.PagedResponse;
import com.vaeto.crm.security.UserPrincipal;
import com.vaeto.crm.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<LeadDto>>> getLeads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String ownerId,
            @RequestParam(defaultValue = "false") boolean includeDeleted
    ) {
        PagedResponse<LeadDto> response = leadService.getLeads(page, size, search, status, source, ownerId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadDto>> getLeadById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(leadService.getLeadById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeadDto>> createLead(
            @Valid @RequestBody LeadRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "1";
        String actorName = currentUser != null ? currentUser.getName() : "System Admin";
        LeadDto created = leadService.createLead(request, actorId, actorName);
        return ResponseEntity.ok(ApiResponse.success("Lead created successfully", created));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<ApiResponse<LeadDto>> updateLead(
            @PathVariable String id,
            @Valid @RequestBody LeadRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "1";
        String actorName = currentUser != null ? currentUser.getName() : "System";
        LeadDto updated = leadService.updateLead(id, request, actorId, actorName);
        return ResponseEntity.ok(ApiResponse.success("Lead updated successfully", updated));
    }

    /**
     * REQUIREMENT 6: Allow only ADMIN users to delete leads.
     * Regular USER accounts will receive 403 Forbidden.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLead(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "1";
        String actorName = currentUser != null ? currentUser.getName() : "System Admin";
        leadService.deleteLead(id, actorId, actorName);
        return ResponseEntity.ok(ApiResponse.success("Lead deleted successfully by Administrator", null));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportLeadsCsv() {
        String csvData = leadService.exportLeadsToCsv();
        byte[] bytes = csvData.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"vaeto_leads.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @PostMapping("/bulk-import")
    public ResponseEntity<ApiResponse<BulkImportResultDto>> bulkImportLeads(
            @RequestBody BulkImportRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "1";
        String actorName = currentUser != null ? currentUser.getName() : "System Admin";
        BulkImportResultDto result = leadService.bulkImportLeads(request, actorId, actorName);
        return ResponseEntity.ok(ApiResponse.success("Bulk import completed successfully", result));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BulkImportResultDto>> importLeadsFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "true") boolean skipDuplicates,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "1";
        String actorName = currentUser != null ? currentUser.getName() : "System Admin";
        BulkImportResultDto result = leadService.bulkImportFile(file, skipDuplicates, actorId, actorName);
        return ResponseEntity.ok(ApiResponse.success("File imported successfully", result));
    }

    @GetMapping("/import/template")
    public ResponseEntity<byte[]> downloadExcelTemplate() throws IOException {
        byte[] bytes = leadService.generateExcelTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"vaeto_leads_template.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
}
