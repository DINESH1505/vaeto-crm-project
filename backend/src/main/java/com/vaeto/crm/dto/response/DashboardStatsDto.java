package com.vaeto.crm.dto.response;

import java.util.List;

public class DashboardStatsDto {

    public static class Metric {
        private long value;
        private String trend;
        private List<Integer> spark;

        public Metric() {
        }

        public Metric(long value, String trend, List<Integer> spark) {
            this.value = value;
            this.trend = trend;
            this.spark = spark;
        }

        public long getValue() {
            return value;
        }

        public void setValue(long value) {
            this.value = value;
        }

        public String getTrend() {
            return trend;
        }

        public void setTrend(String trend) {
            this.trend = trend;
        }

        public List<Integer> getSpark() {
            return spark;
        }

        public void setSpark(List<Integer> spark) {
            this.spark = spark;
        }
    }

    private Metric totalLeads;
    private Metric totalContacts;
    private Metric todaysMeetings;
    private Metric followUps;
    private Metric completedMeetings;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(Metric totalLeads, Metric totalContacts, Metric todaysMeetings, Metric followUps, Metric completedMeetings) {
        this.totalLeads = totalLeads;
        this.totalContacts = totalContacts;
        this.todaysMeetings = todaysMeetings;
        this.followUps = followUps;
        this.completedMeetings = completedMeetings;
    }

    public Metric getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(Metric totalLeads) {
        this.totalLeads = totalLeads;
    }

    public Metric getTotalContacts() {
        return totalContacts;
    }

    public void setTotalContacts(Metric totalContacts) {
        this.totalContacts = totalContacts;
    }

    public Metric getTodaysMeetings() {
        return todaysMeetings;
    }

    public void setTodaysMeetings(Metric todaysMeetings) {
        this.todaysMeetings = todaysMeetings;
    }

    public Metric getFollowUps() {
        return followUps;
    }

    public void setFollowUps(Metric followUps) {
        this.followUps = followUps;
    }

    public Metric getCompletedMeetings() {
        return completedMeetings;
    }

    public void setCompletedMeetings(Metric completedMeetings) {
        this.completedMeetings = completedMeetings;
    }
}
