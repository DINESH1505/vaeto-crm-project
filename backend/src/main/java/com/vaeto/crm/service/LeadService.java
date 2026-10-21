package com.vaeto.crm.service;

import com.vaeto.crm.dto.request.LeadRequest;
import com.vaeto.crm.dto.response.LeadDto;
import com.vaeto.crm.dto.response.PagedResponse;
import com.vaeto.crm.exception.ResourceNotFoundException;
import com.vaeto.crm.model.Lead;
import com.vaeto.crm.repository.LeadRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final AuditService auditService;
    private final PhoneNumberService phoneNumberService;

    public LeadService(LeadRepository leadRepository, AuditService auditService, PhoneNumberService phoneNumberService) {
        this.leadRepository = leadRepository;
        this.auditService = auditService;
        this.phoneNumberService = phoneNumberService;
    }

    public PagedResponse<LeadDto> getLeads(int page, int size, String search, String status, String source, String ownerId, boolean includeDeleted) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));

        Long parsedOwnerId = null;
        if (ownerId != null && !ownerId.isBlank() && !"all".equalsIgnoreCase(ownerId)) {
            try {
                parsedOwnerId = Long.parseLong(ownerId.trim());
            } catch (Exception ignored) {}
        }

        String filterStatus = (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) ? status.trim() : null;
        String filterSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<Lead> leadPage = leadRepository.findFiltered(
                parsedOwnerId,
                filterStatus,
                filterSearch,
                includeDeleted,
                pageable
        );

        List<LeadDto> dtos = leadPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                leadPage.getNumber(),
                leadPage.getSize(),
                leadPage.getTotalElements(),
                leadPage.getTotalPages(),
                leadPage.isLast()
        );
    }

    public LeadDto getLeadById(String id) {
        try {
            Long numericId = Long.parseLong(id);
            Lead lead = leadRepository.findById(numericId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
            return mapToDto(lead);
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Invalid lead id: " + id);
        }
    }

    @Transactional
    public LeadDto createLead(LeadRequest request, String actorId, String actorName) {
        Lead lead = new Lead();
        lead.setCompany(request.getCompany());
        lead.setContactName(request.getContactName());
        lead.setEmail(request.getEmail());

        // Validate and normalize international phone number to E.164 format
        String normalizedPhone = phoneNumberService.validateAndNormalize(request.getPhone(), request.getCountryCode());
        lead.setPhone(normalizedPhone);

        String st = request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "New";
        if ("Scheduled".equalsIgnoreCase(st)) st = "Meeting Scheduled";
        else if ("Completed".equalsIgnoreCase(st)) st = "Won";
        else if ("In Progress".equalsIgnoreCase(st)) st = "Contacted";
        lead.setStatus(st);

        if (request.getMeetingDate() != null) lead.setMeetingDate(request.getMeetingDate());
        if (request.getMeetingTime() != null) lead.setMeetingTime(request.getMeetingTime());
        if (request.getLastContact() != null) lead.setLastContact(request.getLastContact());
        if (lead.getConnectedOn() == null) lead.setConnectedOn(LocalDate.now());

        lead.setComments(request.getComments());
        lead.setSource(request.getSource() != null ? request.getSource() : "Website");
        lead.setIndustry(request.getIndustry());
        lead.setDealValue(request.getDealValue() != null ? request.getDealValue() : 0.0);
        lead.setPriority(request.getPriority() != null ? request.getPriority() : "Medium");
        lead.setIsDeleted(false);

        Long actorNum = 1L;
        if (actorId != null && !actorId.isBlank()) {
            try {
                actorNum = Long.parseLong(actorId.trim());
            } catch (Exception ignored) {}
        }
        lead.setCreatedBy(actorNum);

        Long assignedToNum = actorNum;
        if (request.getOwnerId() != null && !request.getOwnerId().isBlank()) {
            try {
                assignedToNum = Long.parseLong(request.getOwnerId().trim());
            } catch (Exception ignored) {}
        }
        lead.setAssignedTo(assignedToNum);

        lead.setCreatedAt(LocalDateTime.now());
        lead.setUpdatedAt(LocalDateTime.now());

        Lead saved = leadRepository.save(lead);
        auditService.log(actorNum, actorName, "CREATE_LEAD", "leads", saved.getId(), "Created lead for company: " + saved.getCompany());
        return mapToDto(saved);
    }

    @Transactional
    public LeadDto updateLead(String id, LeadRequest request, String actorId, String actorName) {
        try {
            Long numericId = Long.parseLong(id);
            Lead lead = leadRepository.findById(numericId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

            if (request.getCompany() != null && !request.getCompany().isBlank()) lead.setCompany(request.getCompany());
            if (request.getContactName() != null && !request.getContactName().isBlank()) lead.setContactName(request.getContactName());
            if (request.getEmail() != null) lead.setEmail(request.getEmail());
            if (request.getPhone() != null) {
                String normalizedPhone = phoneNumberService.validateAndNormalize(request.getPhone(), request.getCountryCode());
                lead.setPhone(normalizedPhone);
            }
            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                String st = request.getStatus();
                if ("Scheduled".equalsIgnoreCase(st)) st = "Meeting Scheduled";
                else if ("Completed".equalsIgnoreCase(st)) st = "Won";
                else if ("In Progress".equalsIgnoreCase(st)) st = "Contacted";
                lead.setStatus(st);
            }
            if (request.getMeetingDate() != null) lead.setMeetingDate(request.getMeetingDate());
            if (request.getMeetingTime() != null) lead.setMeetingTime(request.getMeetingTime());
            if (request.getLastContact() != null) lead.setLastContact(request.getLastContact());
            if (request.getComments() != null) lead.setComments(request.getComments());
            if (request.getSource() != null) lead.setSource(request.getSource());
            if (request.getIndustry() != null) lead.setIndustry(request.getIndustry());
            if (request.getDealValue() != null) lead.setDealValue(request.getDealValue());
            if (request.getPriority() != null) lead.setPriority(request.getPriority());
            if (lead.getConnectedOn() == null) lead.setConnectedOn(LocalDate.now());
            lead.setUpdatedAt(LocalDateTime.now());

            Lead saved = leadRepository.save(lead);
            auditService.log(actorId, actorName, "UPDATE_LEAD", "leads", saved.getId(), "Updated lead for: " + saved.getCompany());
            return mapToDto(saved);
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Invalid lead id: " + id);
        }
    }

    @Transactional
    public void deleteLead(String id, String actorId, String actorName) {
        try {
            Long numericId = Long.parseLong(id);
            Lead lead = leadRepository.findById(numericId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

            // Soft-delete to preserve existing database records
            lead.setIsDeleted(true);
            lead.setDeletedAt(LocalDateTime.now());
            Long deletedByNum = 1L;
            if (actorId != null && !actorId.isBlank()) {
                try {
                    deletedByNum = Long.parseLong(actorId.trim());
                } catch (Exception ignored) {}
            }
            lead.setDeletedBy(deletedByNum);
            leadRepository.save(lead);
            auditService.log(deletedByNum, actorName, "DELETE_LEAD", "leads", id, "Admin deleted lead: " + lead.getCompany());
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Invalid lead id: " + id);
        }
    }

    public String exportLeadsToCsv() {
        List<Lead> leads = leadRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Company,Contact Name,Email,Phone,Status,Deal Value,Priority,Source,Industry\n");
        for (Lead l : leads) {
            if (Boolean.TRUE.equals(l.getIsDeleted())) continue;
            sb.append(escapeCsv(String.valueOf(l.getId()))).append(",")
              .append(escapeCsv(l.getCompany())).append(",")
              .append(escapeCsv(l.getContactName())).append(",")
              .append(escapeCsv(l.getEmail())).append(",")
              .append(escapeCsv(l.getPhone())).append(",")
              .append(escapeCsv(l.getStatus())).append(",")
              .append(l.getDealValue()).append(",")
              .append(escapeCsv(l.getPriority())).append(",")
              .append(escapeCsv(l.getSource())).append(",")
              .append(escapeCsv(l.getIndustry())).append("\n");
        }
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    public LeadDto mapToDto(Lead lead) {
        LeadDto dto = new LeadDto();
        dto.setId(lead.getId() != null ? String.valueOf(lead.getId()) : null);
        dto.setCompany(lead.getCompany());
        dto.setContactName(lead.getContactName());
        dto.setEmail(lead.getEmail());
        dto.setPhone(lead.getPhone());
        dto.setStatus(lead.getStatus());
        dto.setMeetingDate(lead.getMeetingDate());
        dto.setMeetingTime(lead.getMeetingTime());
        dto.setLastContact(lead.getLastContact());
        dto.setComments(lead.getComments());
        dto.setSource(lead.getSource() != null ? lead.getSource() : "Website");
        dto.setIndustry(lead.getIndustry() != null ? lead.getIndustry() : "IT Services");
        dto.setDealValue(lead.getDealValue() != null ? lead.getDealValue() : 0.0);
        dto.setPriority(lead.getPriority() != null ? lead.getPriority() : "Medium");
        dto.setOwnerId(lead.getOwnerId() != null ? lead.getOwnerId() : "1");
        dto.setAddress(lead.getAddress() != null ? lead.getAddress() : "India");
        dto.setWebsite(lead.getWebsite());
        dto.setCreatedAt(lead.getCreatedAt());
        dto.setUpdatedAt(lead.getUpdatedAt());
        dto.setIsDeleted(lead.getIsDeleted());
        return dto;
    }
}
