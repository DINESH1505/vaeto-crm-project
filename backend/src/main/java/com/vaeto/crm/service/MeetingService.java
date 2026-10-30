package com.vaeto.crm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vaeto.crm.dto.request.MeetingRequest;
import com.vaeto.crm.dto.response.MeetingDto;
import com.vaeto.crm.exception.ResourceNotFoundException;
import com.vaeto.crm.model.Lead;
import com.vaeto.crm.model.Meeting;
import com.vaeto.crm.repository.LeadRepository;
import com.vaeto.crm.repository.MeetingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final LeadRepository leadRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MeetingService(MeetingRepository meetingRepository, LeadRepository leadRepository) {
        this.meetingRepository = meetingRepository;
        this.leadRepository = leadRepository;
    }

    public List<MeetingDto> getMeetings(String startDate, String endDate, String ownerId) {
        Long ownerNum = null;
        if (ownerId != null && !ownerId.isBlank()) {
            try {
                ownerNum = Long.parseLong(ownerId.trim());
            } catch (Exception ignored) {}
        }
        LocalDate start = parseDateSafe(startDate);
        LocalDate end = parseDateSafe(endDate);

        return meetingRepository.findByDateRange(ownerNum, start, end).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MeetingDto createMeeting(MeetingRequest request, String actorId) {
        Meeting meeting = new Meeting();

        Long leadNum = 1L;
        if (request.getLeadId() != null && !request.getLeadId().isBlank()) {
            try {
                leadNum = Long.parseLong(request.getLeadId().trim());
            } catch (Exception ignored) {}
        }
        meeting.setLeadId(leadNum);

        meeting.setTitle(request.getTitle() != null && !request.getTitle().isBlank() ? request.getTitle().trim() : "Meeting");

        LocalDate meetingDate = parseDateSafe(request.getDate());
        if (meetingDate == null) {
            meetingDate = LocalDate.now();
        }
        meeting.setMeetingDate(meetingDate);

        LocalTime startTime = parseTimeSafe(request.getTime());
        if (startTime == null) {
            startTime = LocalTime.of(10, 0);
        }
        meeting.setStartTime(startTime);

        int duration = request.getDurationMins() != null ? request.getDurationMins() : 30;
        meeting.setEndTime(startTime.plusMinutes(duration));

        meeting.setMeetingType(normalizeModeToType(request.getMode()));
        meeting.setLocationLink(request.getLocation() != null ? request.getLocation().trim() : null);
        meeting.setStatus(normalizeStatus(request.getStatus()));

        String packedNotes = packNotes(request.getAttendees(), duration, request.getNotes());
        meeting.setNotes(packedNotes);

        Long owner = 1L;
        String reqOwner = (request.getOwnerId() != null && !request.getOwnerId().isBlank()) ? request.getOwnerId() : actorId;
        if (reqOwner != null && !reqOwner.isBlank()) {
            try {
                owner = Long.parseLong(reqOwner.trim());
            } catch (Exception ignored) {}
        }
        meeting.setCreatedBy(owner);

        meeting.setCreatedAt(LocalDateTime.now());
        meeting.setUpdatedAt(LocalDateTime.now());

        Meeting saved = meetingRepository.save(meeting);
        syncLeadMeetingDetails(saved.getLeadId());
        return mapToDto(saved);
    }

    @Transactional
    public MeetingDto updateMeeting(String id, MeetingRequest request) {
        Long numericId = Long.parseLong(id);
        Meeting meeting = meetingRepository.findById(numericId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + id));

        Long oldLeadId = meeting.getLeadId();

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            meeting.setTitle(request.getTitle().trim());
        }
        if (request.getDate() != null && !request.getDate().isBlank()) {
            LocalDate d = parseDateSafe(request.getDate());
            if (d != null) meeting.setMeetingDate(d);
        }
        if (request.getTime() != null && !request.getTime().isBlank()) {
            LocalTime t = parseTimeSafe(request.getTime());
            if (t != null) {
                meeting.setStartTime(t);
                int duration = request.getDurationMins() != null ? request.getDurationMins() : 30;
                meeting.setEndTime(t.plusMinutes(duration));
            }
        }
        if (request.getMode() != null) {
            meeting.setMeetingType(normalizeModeToType(request.getMode()));
        }
        if (request.getLocation() != null) {
            meeting.setLocationLink(request.getLocation());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            meeting.setStatus(normalizeStatus(request.getStatus()));
        }
        if (request.getLeadId() != null && !request.getLeadId().isBlank()) {
            try {
                meeting.setLeadId(Long.parseLong(request.getLeadId().trim()));
            } catch (Exception ignored) {}
        }

        Map<String, String> currentMeta = unpackNotes(meeting.getNotes());
        String currentAttendees = currentMeta.getOrDefault("attendees", "");
        String currentNotes = currentMeta.getOrDefault("notes", "");
        String newAttendees = request.getAttendees() != null ? request.getAttendees() : currentAttendees;
        String newNotes = request.getNotes() != null ? request.getNotes() : currentNotes;
        int duration = request.getDurationMins() != null ? request.getDurationMins() : 30;
        meeting.setNotes(packNotes(newAttendees, duration, newNotes));

        meeting.setUpdatedAt(LocalDateTime.now());
        Meeting saved = meetingRepository.save(meeting);
        syncLeadMeetingDetails(saved.getLeadId());
        if (oldLeadId != null && !oldLeadId.equals(saved.getLeadId())) {
            syncLeadMeetingDetails(oldLeadId);
        }
        return mapToDto(saved);
    }

    @Transactional
    public MeetingDto markCompleted(String id) {
        Long numericId = Long.parseLong(id);
        Meeting meeting = meetingRepository.findById(numericId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + id));

        meeting.setStatus("Completed");
        meeting.setUpdatedAt(LocalDateTime.now());
        Meeting saved = meetingRepository.save(meeting);
        syncLeadMeetingDetails(saved.getLeadId());
        return mapToDto(saved);
    }

    @Transactional
    public MeetingDto markScheduled(String id) {
        Long numericId = Long.parseLong(id);
        Meeting meeting = meetingRepository.findById(numericId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + id));

        meeting.setStatus("Scheduled");
        meeting.setUpdatedAt(LocalDateTime.now());
        Meeting saved = meetingRepository.save(meeting);
        syncLeadMeetingDetails(saved.getLeadId());
        return mapToDto(saved);
    }

    @Transactional
    public void deleteMeeting(String id) {
        try {
            Long numericId = Long.parseLong(id);
            Meeting meeting = meetingRepository.findById(numericId).orElse(null);
            meetingRepository.deleteById(numericId);
            if (meeting != null) {
                syncLeadMeetingDetails(meeting.getLeadId());
            }
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Invalid meeting id: " + id);
        }
    }

    @Transactional
    public void syncLeadMeetingDetails(Long leadId) {
        if (leadId == null) return;
        try {
            Lead lead = leadRepository.findById(leadId).orElse(null);
            if (lead == null) return;

            List<Meeting> activeMeetings = meetingRepository.findActiveByLeadId(leadId);
            if (activeMeetings == null || activeMeetings.isEmpty()) {
                lead.setMeetingTime(null);
                leadRepository.save(lead);
                return;
            }

            LocalDate today = LocalDate.now();

            // Find upcoming meetings (meetingDate >= today and not Completed and not Cancelled)
            List<Meeting> upcoming = activeMeetings.stream()
                    .filter(m -> m.getMeetingDate() != null
                            && !m.getMeetingDate().isBefore(today)
                            && !"Completed".equalsIgnoreCase(m.getStatus())
                            && !"Cancelled".equalsIgnoreCase(m.getStatus()))
                    .sorted(Comparator.comparing(Meeting::getMeetingDate).thenComparing(m -> m.getStartTime() != null ? m.getStartTime() : LocalTime.MIDNIGHT))
                    .collect(Collectors.toList());

            Meeting targetMeeting = !upcoming.isEmpty() ? upcoming.get(0) : null;

            if (targetMeeting != null) {
                lead.setMeetingTime(targetMeeting.getStartTime() != null ? targetMeeting.getStartTime().toString() : null);
                if ("New".equalsIgnoreCase(lead.getStatus())) {
                    lead.setStatus("Meeting Scheduled");
                }
            } else {
                lead.setMeetingTime(null);
            }
            lead.setUpdatedAt(LocalDateTime.now());
            leadRepository.save(lead);
        } catch (Exception ignored) {}
    }

    public MeetingDto mapToDto(Meeting m) {
        MeetingDto dto = new MeetingDto();
        dto.setId(m.getId() != null ? String.valueOf(m.getId()) : null);
        dto.setLeadId(m.getLeadId() != null ? String.valueOf(m.getLeadId()) : null);
        dto.setTitle(m.getTitle());
        dto.setDate(m.getMeetingDate() != null ? m.getMeetingDate().toString() : "");
        dto.setTime(m.getStartTime() != null ? m.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "10:00");
        dto.setMode(normalizeTypeToMode(m.getMeetingType()));
        dto.setLocation(m.getLocationLink());
        dto.setStatus(m.getStatus() != null ? m.getStatus() : "Scheduled");
        dto.setOwnerId(m.getCreatedBy() != null ? String.valueOf(m.getCreatedBy()) : "1");
        dto.setCreatedAt(m.getCreatedAt());
        dto.setUpdatedAt(m.getUpdatedAt());

        Map<String, String> meta = unpackNotes(m.getNotes());
        dto.setAttendees(meta.getOrDefault("attendees", ""));
        dto.setNotes(meta.getOrDefault("notes", ""));

        int dur = 30;
        if (m.getStartTime() != null && m.getEndTime() != null) {
            dur = (int) ChronoUnit.MINUTES.between(m.getStartTime(), m.getEndTime());
            if (dur <= 0) dur = 30;
        } else {
            try {
                dur = Integer.parseInt(meta.getOrDefault("duration", "30"));
            } catch (Exception ignored) {}
        }
        dto.setDurationMins(dur);

        return dto;
    }

    public String packNotes(String attendees, int durationMins, String notes) {
        Map<String, String> map = new LinkedHashMap<>();
        if (attendees != null && !attendees.isBlank()) map.put("attendees", attendees.trim());
        map.put("duration", String.valueOf(durationMins));
        if (notes != null && !notes.isBlank()) map.put("notes", notes.trim());
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return notes != null ? notes : "";
        }
    }

    public Map<String, String> unpackNotes(String rawNotes) {
        Map<String, String> result = new LinkedHashMap<>();
        if (rawNotes == null || rawNotes.isBlank()) {
            return result;
        }
        if (rawNotes.trim().startsWith("{")) {
            try {
                return objectMapper.readValue(rawNotes, new TypeReference<Map<String, String>>() {});
            } catch (Exception ignored) {}
        }
        result.put("notes", rawNotes);
        return result;
    }

    private String normalizeModeToType(String mode) {
        if (mode == null) return "Online / Video Call";
        String m = mode.trim();
        if ("In Person".equalsIgnoreCase(m) || "In-Person".equalsIgnoreCase(m)) {
            return "In-Person";
        }
        if ("Phone".equalsIgnoreCase(m) || "Phone Call".equalsIgnoreCase(m)) {
            return "Phone Call";
        }
        return "Online / Video Call";
    }

    private String normalizeTypeToMode(String type) {
        if (type == null) return "Online";
        String t = type.trim();
        if ("In-Person".equalsIgnoreCase(t) || "In Person".equalsIgnoreCase(t)) {
            return "In Person";
        }
        if ("Phone Call".equalsIgnoreCase(t) || "Phone".equalsIgnoreCase(t)) {
            return "Phone";
        }
        return "Online";
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return "Scheduled";
        String s = status.trim();
        if ("Completed".equalsIgnoreCase(s) || "Done".equalsIgnoreCase(s)) return "Completed";
        if ("Cancelled".equalsIgnoreCase(s)) return "Cancelled";
        if ("Rescheduled".equalsIgnoreCase(s)) return "Rescheduled";
        return "Scheduled";
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

    private LocalTime parseTimeSafe(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) return null;
        try {
            return LocalTime.parse(timeStr.trim(), DateTimeFormatter.ofPattern("HH:mm"));
        } catch (Exception e) {
            try {
                return LocalTime.parse(timeStr.trim(), DateTimeFormatter.ofPattern("HH:mm:ss"));
            } catch (Exception ex) {
                try {
                    return LocalTime.parse(timeStr.trim());
                } catch (Exception ex2) {
                    return null;
                }
            }
        }
    }
}
