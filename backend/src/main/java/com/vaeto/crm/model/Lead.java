package com.vaeto.crm.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "company_name", nullable = false, length = 200)
    private String company;

    @Column(name = "person_name", nullable = false, length = 150)
    private String contactName;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "contact", length = 50)
    private String phone;

    @Column(name = "meeting_status", length = 50)
    private String status = "New";

    @Column(name = "connected_on")
    private LocalDate connectedOn;

    @Column(name = "meeting_time")
    private LocalTime meetingTime;

    @Column(name = "last_connect_date")
    private LocalDate lastContactDate;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "next_follow_up_date")
    private LocalDate nextFollowUpDate;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Transient attributes used by the UI (not present in MySQL leads table)
    @Transient
    private String source = "Website";

    @Transient
    private String industry = "IT Services";

    @Transient
    private Double dealValue = 0.0;

    @Transient
    private String priority = "Medium";

    @Transient
    private String ownerId;

    @Transient
    private String address = "India";

    @Transient
    private String website;

    public Lead() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setId(String id) {
        if (id != null) {
            try {
                this.id = Long.parseLong(id);
            } catch (Exception ignored) {}
        }
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getConnectedOn() {
        return connectedOn;
    }

    public void setConnectedOn(LocalDate connectedOn) {
        this.connectedOn = connectedOn;
    }

    public String getMeetingDate() {
        if (connectedOn != null) {
            return connectedOn.toString();
        }
        if (nextFollowUpDate != null) {
            return nextFollowUpDate.toString();
        }
        return null;
    }

    public void setMeetingDate(String meetingDate) {
        if (meetingDate != null && !meetingDate.isBlank()) {
            try {
                String clean = meetingDate.trim();
                if (clean.length() >= 10) {
                    this.connectedOn = LocalDate.parse(clean.substring(0, 10));
                }
            } catch (Exception ignored) {}
        }
    }

    public String getMeetingTime() {
        return meetingTime != null ? meetingTime.toString() : null;
    }

    public void setMeetingTime(String meetingTime) {
        if (meetingTime != null && !meetingTime.isBlank()) {
            try {
                String clean = meetingTime.trim();
                if (clean.length() == 5) clean += ":00";
                this.meetingTime = LocalTime.parse(clean);
            } catch (Exception ignored) {}
        }
    }

    public String getLastContact() {
        return lastContactDate != null ? lastContactDate.toString() : null;
    }

    public void setLastContact(String lastContact) {
        if (lastContact != null && !lastContact.isBlank()) {
            try {
                String clean = lastContact.trim();
                if (clean.length() >= 10) {
                    this.lastContactDate = LocalDate.parse(clean.substring(0, 10));
                }
            } catch (Exception ignored) {}
        }
    }

    public LocalDate getLastContactDate() {
        return lastContactDate;
    }

    public void setLastContactDate(LocalDate lastContactDate) {
        this.lastContactDate = lastContactDate;
    }

    public LocalDate getNextFollowUpDate() {
        return nextFollowUpDate;
    }

    public void setNextFollowUpDate(LocalDate nextFollowUpDate) {
        this.nextFollowUpDate = nextFollowUpDate;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public Long getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(Long deletedBy) {
        this.deletedBy = deletedBy;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public Double getDealValue() {
        return dealValue;
    }

    public void setDealValue(Double dealValue) {
        this.dealValue = dealValue;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getOwnerId() {
        if (ownerId != null) return ownerId;
        if (assignedTo != null) return String.valueOf(assignedTo);
        if (createdBy != null) return String.valueOf(createdBy);
        return null;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
        if (ownerId != null) {
            try {
                this.assignedTo = Long.parseLong(ownerId);
            } catch (Exception ignored) {}
        }
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
