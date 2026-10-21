package com.vaeto.crm.dto.response;

public class LeadStatusAggregateDto {

    private long total;
    private long scheduled;
    private long completed;
    private long pending;
    private long lost;
    private long inProgress;

    public LeadStatusAggregateDto() {
    }

    public LeadStatusAggregateDto(long total, long scheduled, long completed, long pending, long lost, long inProgress) {
        this.total = total;
        this.scheduled = scheduled;
        this.completed = completed;
        this.pending = pending;
        this.lost = lost;
        this.inProgress = inProgress;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getScheduled() {
        return scheduled;
    }

    public void setScheduled(long scheduled) {
        this.scheduled = scheduled;
    }

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }

    public long getPending() {
        return pending;
    }

    public void setPending(long pending) {
        this.pending = pending;
    }

    public long getLost() {
        return lost;
    }

    public void setLost(long lost) {
        this.lost = lost;
    }

    public long getInProgress() {
        return inProgress;
    }

    public void setInProgress(long inProgress) {
        this.inProgress = inProgress;
    }
}
