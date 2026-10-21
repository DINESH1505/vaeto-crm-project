package com.vaeto.crm.service;

import com.vaeto.crm.dto.request.FollowUpRequest;
import com.vaeto.crm.dto.response.FollowUpDto;
import com.vaeto.crm.dto.response.PagedResponse;
import com.vaeto.crm.exception.ResourceNotFoundException;
import com.vaeto.crm.model.FollowUp;
import com.vaeto.crm.repository.FollowUpRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FollowUpService {

    private final FollowUpRepository followUpRepository;

    public FollowUpService(FollowUpRepository followUpRepository) {
        this.followUpRepository = followUpRepository;
    }

    public PagedResponse<FollowUpDto> getFollowUps(int page, int size, String ownerId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "date").and(Sort.by(Sort.Direction.ASC, "time")));
        Page<FollowUp> resultPage = (ownerId != null && !ownerId.isBlank())
                ? followUpRepository.findByOwnerId(ownerId, pageable)
                : followUpRepository.findAll(pageable);

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
        return followUpRepository.findTop10ByStatusOrderByDateAsc("Pending").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FollowUpDto createFollowUp(FollowUpRequest request, String actorId) {
        FollowUp followUp = new FollowUp();
        followUp.setId("fu_" + UUID.randomUUID().toString().substring(0, 8));
        followUp.setLeadId(request.getLeadId());
        followUp.setTitle(request.getTitle());
        followUp.setType(request.getType() != null ? request.getType() : "Call");
        followUp.setDate(request.getDate());
        followUp.setTime(request.getTime());
        followUp.setNotes(request.getNotes());
        followUp.setStatus(request.getStatus() != null ? request.getStatus() : "Pending");
        followUp.setOwnerId(request.getOwnerId() != null ? request.getOwnerId() : actorId);
        followUp.setCreatedAt(LocalDateTime.now());
        followUp.setUpdatedAt(LocalDateTime.now());

        return mapToDto(followUpRepository.save(followUp));
    }

    @Transactional
    public FollowUpDto updateFollowUp(String id, FollowUpRequest request) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found with id: " + id));

        if (request.getTitle() != null) followUp.setTitle(request.getTitle());
        if (request.getType() != null) followUp.setType(request.getType());
        if (request.getDate() != null) followUp.setDate(request.getDate());
        if (request.getTime() != null) followUp.setTime(request.getTime());
        if (request.getNotes() != null) followUp.setNotes(request.getNotes());
        if (request.getStatus() != null) followUp.setStatus(request.getStatus());
        if (request.getLeadId() != null) followUp.setLeadId(request.getLeadId());
        followUp.setUpdatedAt(LocalDateTime.now());

        return mapToDto(followUpRepository.save(followUp));
    }

    @Transactional
    public FollowUpDto markCompleted(String id) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found with id: " + id));

        followUp.setStatus("Done");
        followUp.setUpdatedAt(LocalDateTime.now());
        return mapToDto(followUpRepository.save(followUp));
    }

    @Transactional
    public void deleteFollowUp(String id) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found with id: " + id));
        followUpRepository.delete(followUp);
    }

    public FollowUpDto mapToDto(FollowUp f) {
        FollowUpDto dto = new FollowUpDto();
        dto.setId(f.getId());
        dto.setLeadId(f.getLeadId());
        dto.setTitle(f.getTitle());
        dto.setType(f.getType());
        dto.setDate(f.getDate());
        dto.setTime(f.getTime());
        dto.setNotes(f.getNotes());
        dto.setStatus(f.getStatus());
        dto.setOwnerId(f.getOwnerId());
        dto.setCreatedAt(f.getCreatedAt());
        dto.setUpdatedAt(f.getUpdatedAt());
        return dto;
    }
}
