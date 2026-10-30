package com.vaeto.crm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vaeto.crm.dto.request.FollowUpRequest;
import com.vaeto.crm.dto.response.FollowUpDto;
import com.vaeto.crm.dto.response.PagedResponse;
import com.vaeto.crm.exception.ResourceNotFoundException;
import com.vaeto.crm.model.FollowUp;
import com.vaeto.crm.model.Lead;
import com.vaeto.crm.repository.FollowUpRepository;
import com.vaeto.crm.repository.LeadRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final LeadRepository leadRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FollowUpService(FollowUpRepository followUpRepository, LeadRepository leadRepository) {
        this.followUpRepository = followUpRepository;
        this.leadRepository = leadRepository;
    }

    public PagedResponse<FollowUpDto> getFollowUps(int page, int size, String ownerId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "scheduledDate"));
        Page<FollowUp> resultPage;
        if (ownerId != null && !ownerId.isBlank()) {
            try {
                Long ownerNum = Long.parseLong(ownerId.trim());
                resultPage = followUpRepository.findByResponsibleUserId(ownerNum, pageable);
            } catch (NumberFormatException e) {
                resultPage = followUpRepository.findAll(pageable);
            }
        } else {
            resultPage = followUpRepository.findAll(pageable);
        }

        List<FollowUpDto> dtos = resultPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isLast()
        );
    }

    public List<FollowUpDto> getUpcomingFollowUps() {
        return followUpRepository.findUpcomingPending().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public synchronized void syncFromLeads() {
        // No-op: Follow-ups must only be created when explicitly scheduled by the user
    }

    @Transactional
    public FollowUpDto createFollowUp(FollowUpRequest request, String actorId) {
        FollowUp followUp = new FollowUp();

        Long leadNum = 1L;
        if (request.getLeadId() != null && !request.getLeadId().isBlank()) {
            try {
                leadNum = Long.parseLong(request.getLeadId().trim());
            } catch (Exception ignored) {}
        }
        followUp.setLeadId(leadNum);

        LocalDate scheduledDate = parseDateSafe(request.getDate());
        if (scheduledDate == null) {
            scheduledDate = LocalDate.now();
        }
        followUp.setScheduledDate(scheduledDate);

        // Safe idempotency: prevent duplicate simultaneous submissions for same lead, date, time and title
        String reqTitle = request.getTitle() != null && !request.getTitle().isBlank() ? request.getTitle().trim() : "Follow-up";
        String reqTime = request.getTime() != null && !request.getTime().isBlank() ? request.getTime().trim() : "10:00";
        List<FollowUp> existing = followUpRepository.findByLeadId(leadNum);
        if (existing != null) {
            for (FollowUp ef : existing) {
                if ("Pending".equalsIgnoreCase(ef.getStatus()) && scheduledDate.equals(ef.getScheduledDate())) {
                    Map<String, String> meta = unpackNotes(ef.getNotes());
                    String eTitle = meta.getOrDefault("title", "Follow-up");
                    String eTime = meta.getOrDefault("time", "10:00");
                    if (eTitle.equalsIgnoreCase(reqTitle) && eTime.equalsIgnoreCase(reqTime)) {
                        return mapToDto(ef);
                    }
                }
            }
        }

        String packed = packNotes(reqTitle, request.getType(), reqTime, request.getNotes());
        followUp.setNotes(packed);

        String reqStatus = request.getStatus();
        if ("Done".equalsIgnoreCase(reqStatus) || "Completed".equalsIgnoreCase(reqStatus)) {
            followUp.setStatus("Completed");
            followUp.setCompletedDate(LocalDate.now());
        } else {
            followUp.setStatus("Pending");
        }

        Long owner = 1L;
        String reqOwner = (request.getOwnerId() != null && !request.getOwnerId().isBlank())
                ? request.getOwnerId()
                : actorId;
        if (reqOwner != null && !reqOwner.isBlank()) {
            try {
                owner = Long.parseLong(reqOwner.trim());
            } catch (Exception ignored) {}
        }
        followUp.setResponsibleUserId(owner);

        followUp.setCreatedAt(LocalDateTime.now());
        followUp.setUpdatedAt(LocalDateTime.now());

        FollowUp saved = followUpRepository.save(followUp);

        // Sync lead next_follow_up_date
        if (saved.getLeadId() != null) {
            syncLeadNextFollowUpDate(saved.getLeadId());
        }

        return mapToDto(saved);
    }

    @Transactional
    public FollowUpDto updateFollowUp(String id, FollowUpRequest request) {
        Long numericId = Long.parseLong(id);
        FollowUp followUp = followUpRepository.findById(numericId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found with id: " + id));

        Map<String, String> currentMeta = unpackNotes(followUp.getNotes());
        String newTitle = request.getTitle() != null ? request.getTitle() : currentMeta.get("title");
        String newType = request.getType() != null ? request.getType() : currentMeta.get("type");
        String newTime = request.getTime() != null ? request.getTime() : currentMeta.get("time");
        String newNotes = request.getNotes() != null ? request.getNotes() : currentMeta.get("notes");

        followUp.setNotes(packNotes(newTitle, newType, newTime, newNotes));

        if (request.getDate() != null && !request.getDate().isBlank()) {
            LocalDate d = parseDateSafe(request.getDate());
            if (d != null) followUp.setScheduledDate(d);
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            if ("Done".equalsIgnoreCase(request.getStatus()) || "Completed".equalsIgnoreCase(request.getStatus())) {
                followUp.setStatus("Completed");
                followUp.setCompletedDate(LocalDate.now());
            } else {
                followUp.setStatus(request.getStatus());
            }
        }

        if (request.getLeadId() != null && !request.getLeadId().isBlank()) {
            try {
                followUp.setLeadId(Long.parseLong(request.getLeadId().trim()));
            } catch (Exception ignored) {}
        }

        followUp.setUpdatedAt(LocalDateTime.now());
        FollowUp saved = followUpRepository.save(followUp);
        followUpRepository.flush();

        if (saved.getLeadId() != null) {
            if ("Completed".equalsIgnoreCase(saved.getStatus())) {
                leadRepository.findById(saved.getLeadId()).ifPresent(lead -> {
                    lead.setLastContact(LocalDate.now().toString());
                    leadRepository.save(lead);
                });
            }
            syncLeadNextFollowUpDate(saved.getLeadId());
        }

        return mapToDto(saved);
    }

    @Transactional
    public FollowUpDto markCompleted(String id) {
        Long numericId = Long.parseLong(id);
        FollowUp followUp = followUpRepository.findById(numericId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found with id: " + id));

        followUp.setStatus("Completed");
        followUp.setCompletedDate(LocalDate.now());
        followUp.setUpdatedAt(LocalDateTime.now());
        FollowUp saved = followUpRepository.save(followUp);
        followUpRepository.flush();

        if (saved.getLeadId() != null) {
            leadRepository.findById(saved.getLeadId()).ifPresent(lead -> {
                lead.setLastContact(LocalDate.now().toString());
                leadRepository.save(lead);
            });
            syncLeadNextFollowUpDate(saved.getLeadId());
        }

        return mapToDto(saved);
    }

    @Transactional
    public void deleteFollowUp(String id) {
        if (id == null || id.isBlank()) {
            throw new ResourceNotFoundException("Follow-up id is required");
        }
        try {
            Long numericId = Long.parseLong(id.trim());
            Optional<FollowUp> opt = followUpRepository.findById(numericId);
            if (opt.isEmpty()) {
                return;
            }
            FollowUp followUp = opt.get();
            Long leadId = followUp.getLeadId();

            followUpRepository.delete(followUp);
            followUpRepository.flush();

            if (leadId != null) {
                syncLeadNextFollowUpDate(leadId);
            }
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Invalid follow-up id: " + id);
        }
    }

    public void syncLeadNextFollowUpDate(Long leadId) {
        if (leadId == null) return;
        leadRepository.findById(leadId).ifPresent(lead -> {
            List<FollowUp> remaining = followUpRepository.findByLeadId(leadId);
            Optional<FollowUp> nextPending = remaining.stream()
                    .filter(f -> !"Completed".equalsIgnoreCase(f.getStatus()) && !"Done".equalsIgnoreCase(f.getStatus()))
                    .filter(f -> f.getScheduledDate() != null)
                    .min(Comparator.comparing(FollowUp::getScheduledDate));
            if (nextPending.isPresent()) {
                lead.setNextFollowUpDate(nextPending.get().getScheduledDate());
            } else {
                lead.setNextFollowUpDate(null);
            }
            leadRepository.save(lead);
        });
    }

    public FollowUpDto mapToDto(FollowUp f) {
        FollowUpDto dto = new FollowUpDto();
        dto.setId(f.getId() != null ? String.valueOf(f.getId()) : null);
        dto.setLeadId(f.getLeadId() != null ? String.valueOf(f.getLeadId()) : null);
        dto.setDate(f.getScheduledDate() != null ? f.getScheduledDate().toString() : "");

        String s = f.getStatus();
        dto.setStatus("Completed".equalsIgnoreCase(s) ? "Done" : (s != null ? s : "Pending"));
        dto.setOwnerId(f.getResponsibleUserId() != null ? String.valueOf(f.getResponsibleUserId()) : "1");
        dto.setCreatedAt(f.getCreatedAt());
        dto.setUpdatedAt(f.getUpdatedAt());

        Map<String, String> meta = unpackNotes(f.getNotes());
        dto.setTitle(meta.getOrDefault("title", "Follow-up"));
        dto.setType(meta.getOrDefault("type", "Call"));
        dto.setTime(meta.getOrDefault("time", "10:00"));
        dto.setNotes(meta.getOrDefault("notes", ""));

        return dto;
    }

    public String packNotes(String title, String type, String time, String notes) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("title", title != null && !title.isBlank() ? title.trim() : "Follow-up");
        map.put("type", type != null && !type.isBlank() ? type.trim() : "Call");
        map.put("time", time != null && !time.isBlank() ? time.trim() : "10:00");
        map.put("notes", notes != null ? notes.trim() : "");
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return notes != null ? notes : "";
        }
    }

    public Map<String, String> unpackNotes(String rawNotes) {
        Map<String, String> result = new LinkedHashMap<>();
        if (rawNotes == null || rawNotes.isBlank()) {
            result.put("title", "Follow-up");
            result.put("type", "Call");
            result.put("time", "10:00");
            result.put("notes", "");
            return result;
        }
        if (rawNotes.trim().startsWith("{")) {
            try {
                return objectMapper.readValue(rawNotes, new TypeReference<Map<String, String>>() {});
            } catch (Exception ignored) {}
        }
        result.put("title", "Follow-up");
        result.put("type", "Call");
        result.put("time", "10:00");
        result.put("notes", rawNotes);
        return result;
    }

    private LocalDate parseDateSafe(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            try {
                return LocalDate.parse(dateStr.trim());
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
