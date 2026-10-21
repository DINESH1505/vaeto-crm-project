package com.vaeto.crm.service;

import com.vaeto.crm.dto.request.MeetingRequest;
import com.vaeto.crm.dto.response.MeetingDto;
import com.vaeto.crm.exception.ResourceNotFoundException;
import com.vaeto.crm.model.Meeting;
import com.vaeto.crm.repository.MeetingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    public List<MeetingDto> getMeetings(String startDate, String endDate, String ownerId) {
        return meetingRepository.findByDateRange(ownerId, startDate, endDate).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MeetingDto createMeeting(MeetingRequest request, String actorId) {
        Meeting meeting = new Meeting();
        meeting.setId("mt_" + UUID.randomUUID().toString().substring(0, 8));
        meeting.setLeadId(request.getLeadId());
        meeting.setTitle(request.getTitle());
        meeting.setDate(request.getDate());
        meeting.setTime(request.getTime());
        meeting.setDurationMins(request.getDurationMins() != null ? request.getDurationMins() : 30);
        meeting.setMode(request.getMode() != null ? request.getMode() : "Online");
        meeting.setLocation(request.getLocation());
        meeting.setAttendees(request.getAttendees());
        meeting.setNotes(request.getNotes());
        meeting.setStatus(request.getStatus() != null ? request.getStatus() : "Scheduled");
        meeting.setOwnerId(request.getOwnerId() != null ? request.getOwnerId() : actorId);
        meeting.setCreatedAt(LocalDateTime.now());
        meeting.setUpdatedAt(LocalDateTime.now());

        return mapToDto(meetingRepository.save(meeting));
    }

    @Transactional
    public MeetingDto updateMeeting(String id, MeetingRequest request) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + id));

        if (request.getTitle() != null) meeting.setTitle(request.getTitle());
        if (request.getDate() != null) meeting.setDate(request.getDate());
        if (request.getTime() != null) meeting.setTime(request.getTime());
        if (request.getDurationMins() != null) meeting.setDurationMins(request.getDurationMins());
        if (request.getMode() != null) meeting.setMode(request.getMode());
        if (request.getLocation() != null) meeting.setLocation(request.getLocation());
        if (request.getAttendees() != null) meeting.setAttendees(request.getAttendees());
        if (request.getNotes() != null) meeting.setNotes(request.getNotes());
        if (request.getStatus() != null) meeting.setStatus(request.getStatus());
        if (request.getLeadId() != null) meeting.setLeadId(request.getLeadId());
        meeting.setUpdatedAt(LocalDateTime.now());

        return mapToDto(meetingRepository.save(meeting));
    }

    @Transactional
    public void deleteMeeting(String id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + id));
        meetingRepository.delete(meeting);
    }

    public MeetingDto mapToDto(Meeting m) {
        MeetingDto dto = new MeetingDto();
        dto.setId(m.getId());
        dto.setLeadId(m.getLeadId());
        dto.setTitle(m.getTitle());
        dto.setDate(m.getDate());
        dto.setTime(m.getTime());
        dto.setDurationMins(m.getDurationMins());
        dto.setMode(m.getMode());
        dto.setLocation(m.getLocation());
        dto.setAttendees(m.getAttendees());
        dto.setNotes(m.getNotes());
        dto.setStatus(m.getStatus());
        dto.setOwnerId(m.getOwnerId());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setUpdatedAt(m.getUpdatedAt());
        return dto;
    }
}
