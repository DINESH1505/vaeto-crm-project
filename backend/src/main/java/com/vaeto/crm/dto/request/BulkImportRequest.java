package com.vaeto.crm.dto.request;

import java.util.ArrayList;
import java.util.List;

public class BulkImportRequest {

    private boolean skipDuplicates = true;
    private List<LeadRequest> leads = new ArrayList<>();

    public BulkImportRequest() {
    }

    public boolean isSkipDuplicates() {
        return skipDuplicates;
    }

    public void setSkipDuplicates(boolean skipDuplicates) {
        this.skipDuplicates = skipDuplicates;
    }

    public List<LeadRequest> getLeads() {
        return leads;
    }

    public void setLeads(List<LeadRequest> leads) {
        this.leads = leads;
    }
}
