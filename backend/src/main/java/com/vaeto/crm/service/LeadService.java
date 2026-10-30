package com.vaeto.crm.service;

import com.vaeto.crm.dto.request.BulkImportRequest;
import com.vaeto.crm.dto.request.LeadRequest;
import com.vaeto.crm.dto.response.BulkImportResultDto;
import com.vaeto.crm.dto.response.LeadDto;
import com.vaeto.crm.dto.response.PagedResponse;
import com.vaeto.crm.exception.BadRequestException;
import com.vaeto.crm.exception.ResourceNotFoundException;
import com.vaeto.crm.model.Lead;
import com.vaeto.crm.model.Meeting;
import com.vaeto.crm.repository.LeadRepository;
import com.vaeto.crm.repository.MeetingRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final AuditService auditService;
    private final PhoneNumberService phoneNumberService;
    private final MeetingRepository meetingRepository;

    public LeadService(LeadRepository leadRepository, AuditService auditService, PhoneNumberService phoneNumberService) {
        this(leadRepository, auditService, phoneNumberService, null);
    }

    @Autowired
    public LeadService(LeadRepository leadRepository, AuditService auditService, PhoneNumberService phoneNumberService, MeetingRepository meetingRepository) {
        this.leadRepository = leadRepository;
        this.auditService = auditService;
        this.phoneNumberService = phoneNumberService;
        this.meetingRepository = meetingRepository;
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

            if (Boolean.TRUE.equals(lead.getIsDeleted())) {
                throw new BadRequestException("Deleted leads cannot be edited as active leads.");
            }
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
        lead.setTitle(request.getTitle() != null && !request.getTitle().isBlank() ? request.getTitle().trim() : null);
        String email = request.getEmail() != null ? request.getEmail().trim() : null;
        if (email != null && email.isBlank()) {
            email = null;
        }
        lead.setEmail(email);

        // Validate and normalize international phone number to E.164 format (optional)
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            String normalizedPhone = phoneNumberService.validateAndNormalize(request.getPhone(), request.getCountryCode());
            lead.setPhone(normalizedPhone);
        } else {
            lead.setPhone(null);
        }
        if (request.getCorporatePhone() != null && !request.getCorporatePhone().isBlank()) {
            lead.setCorporatePhone(request.getCorporatePhone().trim());
        }
        if (request.getWhatsappNumber() != null && !request.getWhatsappNumber().isBlank()) {
            lead.setWhatsappNumber(request.getWhatsappNumber().trim());
        }

        lead.setStatus(normalizeStatus(request.getStatus()));

        if (request.getCompletedOn() != null && !request.getCompletedOn().isBlank()) {
            lead.setCompletedOn(request.getCompletedOn().trim());
        }
        if (lead.getConnectedOn() == null) {
            lead.setConnectedOn(LocalDate.now());
        }
        if (request.getMeetingDate() != null) lead.setMeetingDate(request.getMeetingDate());
        if (request.getMeetingTime() != null) lead.setMeetingTime(request.getMeetingTime());
        if (request.getLastContact() != null) lead.setLastContact(request.getLastContact());
        if (request.getNextFollowUpDate() != null && !request.getNextFollowUpDate().isBlank()) {
            lead.setNextFollowUpDate(parseDateSafe(request.getNextFollowUpDate()));
        }

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

        if (meetingRepository != null && request.getMeetingDate() != null && !request.getMeetingDate().isBlank()) {
            LocalDate mDate = Lead.parseDateSafe(request.getMeetingDate());
            if (mDate != null) {
                LocalTime mTime = Lead.parseTimeSafe(request.getMeetingTime());
                Meeting m = new Meeting();
                m.setLeadId(saved.getId());
                m.setTitle("Meeting with " + saved.getCompany());
                m.setMeetingDate(mDate);
                m.setStartTime(mTime != null ? mTime : LocalTime.of(10, 0));
                m.setEndTime(m.getStartTime().plusMinutes(30));
                m.setStatus("Scheduled");
                m.setMeetingType("Online / Video Call");
                m.setCreatedBy(saved.getCreatedBy() != null ? saved.getCreatedBy() : 1L);
                m.setCreatedAt(LocalDateTime.now());
                m.setUpdatedAt(LocalDateTime.now());
                meetingRepository.save(m);
            }
        }

        auditService.log(actorNum, actorName, "CREATE_LEAD", "leads", saved.getId(), "Created lead for company: " + saved.getCompany());
        return mapToDto(saved);
    }

    @Transactional
    public LeadDto updateLead(String id, LeadRequest request, String actorId, String actorName) {
        try {
            Long numericId = Long.parseLong(id);
            Lead lead = leadRepository.findById(numericId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

            if (Boolean.TRUE.equals(lead.getIsDeleted())) {
                throw new BadRequestException("Deleted leads cannot be edited as active leads.");
            }

            if (request.getCompany() != null && !request.getCompany().isBlank()) lead.setCompany(request.getCompany());
            if (request.getContactName() != null && !request.getContactName().isBlank()) lead.setContactName(request.getContactName());
            if (request.getTitle() != null) lead.setTitle(request.getTitle());
            if (request.getEmail() != null) {
                String email = request.getEmail().trim();
                lead.setEmail(email.isBlank() ? null : email);
            }
            if (request.getPhone() != null) {
                if (!request.getPhone().isBlank()) {
                    String normalizedPhone = phoneNumberService.validateAndNormalize(request.getPhone(), request.getCountryCode());
                    lead.setPhone(normalizedPhone);
                } else {
                    lead.setPhone(null);
                }
            }
            if (request.getCorporatePhone() != null) lead.setCorporatePhone(request.getCorporatePhone());
            if (request.getWhatsappNumber() != null) lead.setWhatsappNumber(request.getWhatsappNumber());
            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                lead.setStatus(normalizeStatus(request.getStatus()));
            }
            // Preserve original completedOn creation/import date when edited later
            if (lead.getConnectedOn() == null) {
                if (request.getCompletedOn() != null && !request.getCompletedOn().isBlank()) {
                    lead.setCompletedOn(request.getCompletedOn().trim());
                }
                if (lead.getConnectedOn() == null) {
                    lead.setConnectedOn(LocalDate.now());
                }
            }
            if (request.getMeetingDate() != null) lead.setMeetingDate(request.getMeetingDate());
            if (request.getMeetingTime() != null) lead.setMeetingTime(request.getMeetingTime());
            if (request.getLastContact() != null) lead.setLastContact(request.getLastContact());
            if (request.getNextFollowUpDate() != null) {
                lead.setNextFollowUpDate(parseDateSafe(request.getNextFollowUpDate()));
            }
            if (request.getComments() != null) lead.setComments(request.getComments());
            if (request.getSource() != null) lead.setSource(request.getSource());
            if (request.getIndustry() != null) lead.setIndustry(request.getIndustry());
            if (request.getDealValue() != null) lead.setDealValue(request.getDealValue());
            if (request.getPriority() != null) lead.setPriority(request.getPriority());
            lead.setUpdatedAt(LocalDateTime.now());

            Lead saved = leadRepository.save(lead);

            if (meetingRepository != null && request.getMeetingDate() != null) {
                String reqDate = request.getMeetingDate().trim();
                if (!reqDate.isBlank()) {
                    LocalDate newDate = Lead.parseDateSafe(reqDate);
                    LocalTime newTime = Lead.parseTimeSafe(request.getMeetingTime());
                    if (newDate != null) {
                        List<Meeting> activeMeetings = meetingRepository.findActiveByLeadId(saved.getId());
                        if (activeMeetings != null && !activeMeetings.isEmpty()) {
                            Meeting m = activeMeetings.get(0);
                            m.setMeetingDate(newDate);
                            if (newTime != null) {
                                m.setStartTime(newTime);
                                m.setEndTime(newTime.plusMinutes(30));
                            }
                            m.setUpdatedAt(LocalDateTime.now());
                            meetingRepository.save(m);
                        } else {
                            Meeting m = new Meeting();
                            m.setLeadId(saved.getId());
                            m.setTitle("Meeting with " + saved.getCompany());
                            m.setMeetingDate(newDate);
                            m.setStartTime(newTime != null ? newTime : LocalTime.of(10, 0));
                            m.setEndTime(m.getStartTime().plusMinutes(30));
                            m.setStatus("Scheduled");
                            m.setMeetingType("Online / Video Call");
                            m.setCreatedBy(saved.getCreatedBy() != null ? saved.getCreatedBy() : 1L);
                            m.setCreatedAt(LocalDateTime.now());
                            m.setUpdatedAt(LocalDateTime.now());
                            meetingRepository.save(m);
                        }
                    }
                }
            }

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

            if (Boolean.TRUE.equals(lead.getIsDeleted())) {
                throw new BadRequestException("Lead is already deleted: " + id);
            }
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
        dto.setTitle(lead.getTitle());
        dto.setEmail(lead.getEmail());
        dto.setPhone(lead.getPhone());
        dto.setCorporatePhone(lead.getCorporatePhone());
        dto.setWhatsappNumber(lead.getWhatsappNumber());
        dto.setStatus(lead.getStatus());
        dto.setCompletedOn(lead.getCompletedOn());

        String meetingDate = null;
        String meetingTime = null;
        if (lead.getId() != null && meetingRepository != null) {
            try {
                List<Meeting> leadMeetings = meetingRepository.findActiveByLeadId(lead.getId());
                if (leadMeetings != null && !leadMeetings.isEmpty()) {
                    LocalDate today = LocalDate.now();
                    List<Meeting> upcoming = leadMeetings.stream()
                            .filter(m -> m.getMeetingDate() != null
                                    && !m.getMeetingDate().isBefore(today)
                                    && !"Completed".equalsIgnoreCase(m.getStatus())
                                    && !"Cancelled".equalsIgnoreCase(m.getStatus()))
                            .sorted(Comparator.comparing(Meeting::getMeetingDate).thenComparing(m -> m.getStartTime() != null ? m.getStartTime() : LocalTime.MIDNIGHT))
                            .collect(Collectors.toList());

                    if (!upcoming.isEmpty()) {
                        Meeting target = upcoming.get(0);
                        if (target.getMeetingDate() != null) {
                            meetingDate = target.getMeetingDate().toString();
                        }
                        if (target.getStartTime() != null) {
                            meetingTime = target.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm"));
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
        dto.setMeetingDate(meetingDate);
        dto.setMeetingTime(meetingTime);

        dto.setLastContact(lead.getLastContact());
        dto.setNextFollowUpDate(lead.getNextFollowUpDate() != null ? lead.getNextFollowUpDate().toString() : null);
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

    @Transactional
    public BulkImportResultDto bulkImportLeads(BulkImportRequest request, String actorId, String actorName) {
        BulkImportResultDto result = new BulkImportResultDto();
        if (request == null || request.getLeads() == null || request.getLeads().isEmpty()) {
            return result;
        }

        List<LeadRequest> incomingList = request.getLeads();
        if (incomingList.size() > 5000) {
            throw new BadRequestException("Upload row count limit exceeded (maximum 5,000 leads per import).");
        }

        result.setTotalDetected(incomingList.size());

        Set<String> existingEmails = new HashSet<>(leadRepository.findAllActiveEmails());
        Set<String> seenInBatch = new HashSet<>();

        Long actorNum = 1L;
        if (actorId != null && !actorId.isBlank()) {
            try {
                actorNum = Long.parseLong(actorId.trim());
            } catch (Exception ignored) {}
        }

        List<Lead> leadsToSave = new ArrayList<>();
        List<LeadRequest> leadsToSaveRequests = new ArrayList<>();
        int rowIndex = 0;

        for (LeadRequest lr : incomingList) {
            rowIndex++;
            String company = lr.getCompany() != null ? lr.getCompany().trim() : "";
            String contactName = lr.getContactName() != null ? lr.getContactName().trim() : "";
            String email = lr.getEmail() != null ? lr.getEmail().trim().toLowerCase() : "";

            if (company.isEmpty() || contactName.isEmpty()) {
                result.setFailedCount(result.getFailedCount() + 1);
                result.getErrorMessages().add("Row " + rowIndex + ": Company Name and Contact Person are required.");
                continue;
            }

            if (!email.isEmpty() && !email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                result.setFailedCount(result.getFailedCount() + 1);
                result.getErrorMessages().add("Row " + rowIndex + " (" + company + "): Invalid email format '" + email + "'.");
                continue;
            }

            if (request.isSkipDuplicates() && !email.isEmpty()) {
                if (existingEmails.contains(email) || seenInBatch.contains(email)) {
                    result.setSkippedCount(result.getSkippedCount() + 1);
                    continue;
                }
            }

            if (!email.isEmpty()) {
                seenInBatch.add(email);
                existingEmails.add(email);
            }

            Lead lead = new Lead();
            lead.setCompany(company);
            lead.setContactName(contactName);
            lead.setTitle(lr.getTitle() != null && !lr.getTitle().isBlank() ? lr.getTitle().trim() : null);
            lead.setEmail(email.isEmpty() ? null : email);

            String phone = lr.getPhone() != null ? lr.getPhone().trim() : "";
            if (!phone.isEmpty()) {
                try {
                    phone = phoneNumberService.validateAndNormalize(phone, lr.getCountryCode());
                } catch (Exception e) {
                    phone = phone.replaceAll("[^0-9+()\\-\\s]", "").trim();
                }
            }
            lead.setPhone(phone.isEmpty() ? null : phone);

            String corpPhone = lr.getCorporatePhone() != null ? lr.getCorporatePhone().trim() : "";
            lead.setCorporatePhone(corpPhone.isEmpty() ? null : corpPhone);

            String waPhone = lr.getWhatsappNumber() != null ? lr.getWhatsappNumber().trim() : "";
            lead.setWhatsappNumber(waPhone.isEmpty() ? null : waPhone);

            lead.setStatus(normalizeStatus(lr.getStatus()));

            lead.setPriority(lr.getPriority() != null && !lr.getPriority().isBlank() ? lr.getPriority().trim() : "Medium");
            lead.setSource(lr.getSource() != null && !lr.getSource().isBlank() ? lr.getSource().trim() : "Website");
            lead.setIndustry(lr.getIndustry() != null ? lr.getIndustry().trim() : "IT Services");
            lead.setDealValue(lr.getDealValue() != null ? lr.getDealValue() : 0.0);
            lead.setComments(lr.getComments() != null && !lr.getComments().isBlank() ? lr.getComments().trim() : null);

            if (lr.getCompletedOn() != null && !lr.getCompletedOn().isBlank()) {
                lead.setCompletedOn(lr.getCompletedOn().trim());
            }
            if (lead.getConnectedOn() == null) {
                lead.setConnectedOn(LocalDate.now());
            }
            if (lr.getMeetingDate() != null && !lr.getMeetingDate().isBlank()) {
                lead.setMeetingDate(lr.getMeetingDate().trim());
            }
            if (lr.getMeetingTime() != null && !lr.getMeetingTime().isBlank()) {
                lead.setMeetingTime(lr.getMeetingTime().trim());
            }
            if (lr.getLastContact() != null && !lr.getLastContact().isBlank()) {
                lead.setLastContact(lr.getLastContact().trim());
            }

            lead.setIsDeleted(false);
            lead.setCreatedBy(actorNum);
            lead.setAssignedTo(actorNum);
            lead.setCreatedAt(LocalDateTime.now());
            lead.setUpdatedAt(LocalDateTime.now());

            leadsToSave.add(lead);
            leadsToSaveRequests.add(lr);
        }

        if (!leadsToSave.isEmpty()) {
            List<Lead> savedLeads = leadRepository.saveAll(leadsToSave);
            if (meetingRepository != null) {
                for (int i = 0; i < savedLeads.size(); i++) {
                    Lead saved = savedLeads.get(i);
                    LeadRequest lr = leadsToSaveRequests.get(i);
                    if (lr.getMeetingDate() != null && !lr.getMeetingDate().isBlank()) {
                        LocalDate mDate = Lead.parseDateSafe(lr.getMeetingDate());
                        if (mDate != null) {
                            LocalTime mTime = Lead.parseTimeSafe(lr.getMeetingTime());
                            Meeting m = new Meeting();
                            m.setLeadId(saved.getId());
                            m.setTitle("Meeting with " + saved.getCompany());
                            m.setMeetingDate(mDate);
                            m.setStartTime(mTime != null ? mTime : LocalTime.of(10, 0));
                            m.setEndTime(m.getStartTime().plusMinutes(30));
                            m.setStatus("Scheduled");
                            m.setMeetingType("Online / Video Call");
                            m.setCreatedBy(actorNum != null ? actorNum : 1L);
                            m.setCreatedAt(LocalDateTime.now());
                            m.setUpdatedAt(LocalDateTime.now());
                            meetingRepository.save(m);
                        }
                    }
                }
            }
            result.setImportedCount(savedLeads.size());
            result.setImportedLeads(savedLeads.stream().map(this::mapToDto).collect(Collectors.toList()));
            if (auditService != null) {
                auditService.log(actorNum, actorName, "BULK_IMPORT_LEADS", "leads", null,
                        "Imported " + savedLeads.size() + " leads, skipped " + result.getSkippedCount() + " duplicates.");
            }
        }

        return result;
    }

    public BulkImportResultDto bulkImportFile(MultipartFile file, boolean skipDuplicates, String actorId, String actorName) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty. Please select a valid Excel or CSV file.");
        }

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv")) {
            throw new BadRequestException("Unsupported file format. Please upload .xlsx, .xls, or .csv files.");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds limit of 10MB.");
        }

        List<LeadRequest> parsedLeads;
        if (fileName.endsWith(".csv")) {
            parsedLeads = parseCsvFile(file);
        } else {
            parsedLeads = parseExcelFile(file);
        }

        BulkImportRequest request = new BulkImportRequest();
        request.setSkipDuplicates(skipDuplicates);
        request.setLeads(parsedLeads);

        return bulkImportLeads(request, actorId, actorName);
    }

    private List<LeadRequest> parseExcelFile(MultipartFile file) {
        List<LeadRequest> leads = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getLastRowNum() < 1) {
                return leads;
            }

            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return leads;

            Map<String, Integer> colIndexMap = new HashMap<>();
            for (Cell cell : headerRow) {
                String header = formatter.formatCellValue(cell).trim().toLowerCase();
                colIndexMap.put(header, cell.getColumnIndex());
            }

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                LeadRequest lr = new LeadRequest();
                lr.setCompany(getCellValue(row, colIndexMap, formatter, "company name", "company", "organization", "companyname"));
                lr.setContactName(getCellValue(row, colIndexMap, formatter, "person name", "contact person", "contact name", "name", "personname"));
                lr.setTitle(getCellValue(row, colIndexMap, formatter, "title", "job title", "designation", "position", "role"));
                lr.setEmail(getCellValue(row, colIndexMap, formatter, "email", "email address", "mail"));
                lr.setPhone(getCellValue(row, colIndexMap, formatter, "contact number", "mobile phone", "mobile", "phone", "contact", "phone number", "cell"));
                lr.setCorporatePhone(getCellValue(row, colIndexMap, formatter, "corporate phone", "corporate contact", "office phone", "work phone", "landline"));
                lr.setWhatsappNumber(getCellValue(row, colIndexMap, formatter, "what's app number", "whatsapp number", "whatsapp", "whats app", "wa number", "whatsapp no"));
                lr.setCompletedOn(getCellValue(row, colIndexMap, formatter, "complete on", "completed on", "complete date", "completed date", "connected on"));
                lr.setMeetingDate(getCellValue(row, colIndexMap, formatter, "meeting date", "next follow-up", "next follow up", "follow-up", "follow up date", "followup"));
                lr.setMeetingTime(getCellValue(row, colIndexMap, formatter, "meeting time", "time"));
                lr.setLastContact(getCellValue(row, colIndexMap, formatter, "last connected", "last connect date", "last contact", "last contacted"));
                lr.setStatus(getCellValue(row, colIndexMap, formatter, "status", "lead status", "stage"));
                lr.setComments(getCellValue(row, colIndexMap, formatter, "comment", "comments", "notes", "description", "remarks"));
                lr.setPriority(getCellValue(row, colIndexMap, formatter, "priority"));
                lr.setIndustry(getCellValue(row, colIndexMap, formatter, "industry"));
                lr.setSource(getCellValue(row, colIndexMap, formatter, "source"));

                String dealValStr = getCellValue(row, colIndexMap, formatter, "deal value", "value", "deal amount");
                if (dealValStr != null && !dealValStr.isBlank()) {
                    try {
                        lr.setDealValue(Double.parseDouble(dealValStr.replaceAll("[^0-9.]", "")));
                    } catch (Exception ignored) {}
                }

                if (lr.getCompany() != null || lr.getContactName() != null) {
                    leads.add(lr);
                }
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to read Excel file: " + e.getMessage());
        }

        return leads;
    }

    private List<LeadRequest> parseCsvFile(MultipartFile file) {
        List<LeadRequest> leads = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) return leads;

            String[] headers = parseCsvLine(headerLine);
            Map<String, Integer> colIndexMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                colIndexMap.put(headers[i].trim().toLowerCase(), i);
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] values = parseCsvLine(line);

                LeadRequest lr = new LeadRequest();
                lr.setCompany(getCsvValue(values, colIndexMap, "company name", "company", "organization", "companyname"));
                lr.setContactName(getCsvValue(values, colIndexMap, "person name", "contact person", "contact name", "name", "personname"));
                lr.setTitle(getCsvValue(values, colIndexMap, "title", "job title", "designation", "position", "role"));
                lr.setEmail(getCsvValue(values, colIndexMap, "email", "email address", "mail"));
                lr.setPhone(getCsvValue(values, colIndexMap, "contact number", "mobile phone", "mobile", "phone", "contact", "phone number", "cell"));
                lr.setCorporatePhone(getCsvValue(values, colIndexMap, "corporate phone", "corporate contact", "office phone", "work phone", "landline"));
                lr.setWhatsappNumber(getCsvValue(values, colIndexMap, "what's app number", "whatsapp number", "whatsapp", "whats app", "wa number", "whatsapp no"));
                lr.setCompletedOn(getCsvValue(values, colIndexMap, "complete on", "completed on", "complete date", "completed date", "connected on"));
                lr.setMeetingDate(getCsvValue(values, colIndexMap, "meeting date", "next follow-up", "next follow up", "follow-up", "follow up date", "followup"));
                lr.setMeetingTime(getCsvValue(values, colIndexMap, "meeting time", "time"));
                lr.setLastContact(getCsvValue(values, colIndexMap, "last connected", "last connect date", "last contact", "last contacted"));
                lr.setStatus(getCsvValue(values, colIndexMap, "status", "lead status", "stage"));
                lr.setComments(getCsvValue(values, colIndexMap, "comment", "comments", "notes", "description", "remarks"));
                lr.setPriority(getCsvValue(values, colIndexMap, "priority"));
                lr.setIndustry(getCsvValue(values, colIndexMap, "industry"));
                lr.setSource(getCsvValue(values, colIndexMap, "source"));

                String dealValStr = getCsvValue(values, colIndexMap, "deal value", "value", "deal amount");
                if (dealValStr != null && !dealValStr.isBlank()) {
                    try {
                        lr.setDealValue(Double.parseDouble(dealValStr.replaceAll("[^0-9.]", "")));
                    } catch (Exception ignored) {}
                }

                if (lr.getCompany() != null || lr.getContactName() != null) {
                    leads.add(lr);
                }
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }
        return leads;
    }

    private String getCellValue(Row row, Map<String, Integer> map, DataFormatter formatter, String... keys) {
        for (String k : keys) {
            String cleanK = k.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
            for (Map.Entry<String, Integer> entry : map.entrySet()) {
                String cleanHeader = entry.getKey().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
                if (cleanHeader.equals(cleanK)) {
                    Cell cell = row.getCell(entry.getValue());
                    if (cell != null) {
                        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                            Date d = cell.getDateCellValue();
                            if (d != null) {
                                return new java.text.SimpleDateFormat("yyyy-MM-dd").format(d);
                            }
                        }
                        String val = formatter.formatCellValue(cell).trim();
                        if (!val.isEmpty()) return val;
                    }
                }
            }
        }
        return null;
    }

    private String getCsvValue(String[] values, Map<String, Integer> map, String... keys) {
        for (String k : keys) {
            String cleanK = k.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
            for (Map.Entry<String, Integer> entry : map.entrySet()) {
                String cleanHeader = entry.getKey().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
                if (cleanHeader.equals(cleanK)) {
                    int idx = entry.getValue();
                    if (idx < values.length) {
                        String val = values[idx].trim();
                        if (!val.isEmpty()) return val;
                    }
                }
            }
        }
        return null;
    }

    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (char c : line.toCharArray()) {
            if (c == '\"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(cur.toString().trim());
                cur.setLength(0);
            } else {
                cur.append(c);
            }
        }
        result.add(cur.toString().trim());
        return result.toArray(new String[0]);
    }

    public byte[] generateExcelTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Leads Import Template");

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columns = {
                    "S.NO", "COMPANY NAME", "PERSON NAME", "TITLE", "EMAIL", "PHONE NUMBER",
                    "CORPORATE PHONE", "WHAT'S APP NUMBER", "COMPLETE ON", "MEETING DATE",
                    "MEETING TIME", "LAST CONTACTED", "STATUS", "COMMENT", "FOLLOW-UPS", "ACTION"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            Object[][] sampleData = {
                    {1, "Apex CyberTech Solutions", "Marcus Vance", "CTO", "marcus.v@apextech.io", "9876543210", "+1 555-0199", "9876543210", "2026-10-20", "2026-11-05", "10:30 AM", "2026-10-22", "Pending", "Enterprise inquiry", "2026-11-05", "Schedule Follow-up"},
                    {2, "Novis Financial Systems", "Elena Rostova", "Director of Operations", "erostova@novisfin.com", "9078654320", "+1 555-0188", "9078654320", "", "2026-11-12", "02:00 PM", "2026-10-24", "Negotiation", "Contract under review", "2026-11-12", "Send Proposal"},
                    {3, "Helios Health Dynamics", "Dr. Aris Thorne", "VP Research", "athorne@helioshealth.org", "+1 (617) 443-8899", "+1 617-443-8800", "+1 (617) 443-8899", "2026-10-18", "2026-11-10", "11:00 AM", "2026-10-25", "Proposal Sent", "Demo scheduled", "2026-11-10", "Follow up with team"},
                    {4, "Quantum Logic Corp", "Jennifer Blake", "Lead Architect", "jblake@quantumlogic.net", "+1 (206) 774-3310", "", "+1 (206) 774-3310", "", "2026-11-15", "03:30 PM", "", "New", "Trial user", "", "Call customer"},
                    {5, "StrataCloud Infrastructure", "Devon Miller", "Infrastructure Head", "dmiller@stratacloud.io", "+1 (312) 991-0422", "+1 312-991-0400", "+1 (312) 991-0422", "2026-10-25", "2026-11-11", "09:00 AM", "2026-10-26", "Contacted", "Discussing migration", "2026-11-11", "Review proposal"}
            };

            for (int r = 0; r < sampleData.length; r++) {
                Row row = sheet.createRow(r + 1);
                for (int c = 0; c < sampleData[r].length; c++) {
                    Cell cell = row.createCell(c);
                    Object val = sampleData[r][c];
                    if (val instanceof Number) {
                        cell.setCellValue(((Number) val).doubleValue());
                    } else if (val != null) {
                        cell.setCellValue(val.toString());
                    }
                }
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private String normalizeStatus(String raw) {
        if (raw == null || raw.isBlank()) return "New";
        String s = raw.trim();
        if ("Scheduled".equalsIgnoreCase(s) || "Meeting Scheduled".equalsIgnoreCase(s)) return "Meeting Scheduled";
        if ("Completed".equalsIgnoreCase(s) || "Won".equalsIgnoreCase(s)) return "Won";
        if ("In Progress".equalsIgnoreCase(s) || "Contacted".equalsIgnoreCase(s)) return "Contacted";
        if ("Proposal Sent".equalsIgnoreCase(s) || "Proposal".equalsIgnoreCase(s)) return "Proposal Sent";
        if ("Negotiation".equalsIgnoreCase(s)) return "Negotiation";
        if ("Lost".equalsIgnoreCase(s)) return "Lost";
        if ("Pending".equalsIgnoreCase(s)) return "Pending";
        if ("New".equalsIgnoreCase(s)) return "New";
        return "New";
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
