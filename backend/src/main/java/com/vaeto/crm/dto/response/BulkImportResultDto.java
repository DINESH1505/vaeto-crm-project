package com.vaeto.crm.dto.response;

import java.util.ArrayList;
import java.util.List;

public class BulkImportResultDto {

    private int totalDetected;
    private int importedCount;
    private int skippedCount;
    private int failedCount;
    private List<String> errorMessages = new ArrayList<>();
    private List<LeadDto> importedLeads = new ArrayList<>();

    public BulkImportResultDto() {
    }

    public int getTotalDetected() {
        return totalDetected;
    }

    public void setTotalDetected(int totalDetected) {
        this.totalDetected = totalDetected;
    }

    public int getImportedCount() {
        return importedCount;
    }

    public void setImportedCount(int importedCount) {
        this.importedCount = importedCount;
    }

    public int getSkippedCount() {
        return skippedCount;
    }

    public void setSkippedCount(int skippedCount) {
        this.skippedCount = skippedCount;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(int failedCount) {
        this.failedCount = failedCount;
    }

    public List<String> getErrorMessages() {
        return errorMessages;
    }

    public void setErrorMessages(List<String> errorMessages) {
        this.errorMessages = errorMessages;
    }

    public List<LeadDto> getImportedLeads() {
        return importedLeads;
    }

    public void setImportedLeads(List<LeadDto> importedLeads) {
        this.importedLeads = importedLeads;
    }
}
