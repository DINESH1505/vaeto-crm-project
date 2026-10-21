package com.vaeto.crm.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sessions")
public class UserSession {

    @Id
    @Column(name = "session_id", nullable = false, length = 128)
    private String sessionId;

    @Column(name = "expires", nullable = false)
    private Long expires;

    @Column(name = "data", columnDefinition = "MEDIUMTEXT")
    private String data;

    public UserSession() {
    }

    public UserSession(String sessionId, Long expires, String data) {
        this.sessionId = sessionId;
        this.expires = expires;
        this.data = data;
    }

    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Long getExpires() {
        return expires;
    }

    public void setExpires(Long expires) {
        this.expires = expires;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getId() {
        return sessionId;
    }

    public void setId(String id) {
        this.sessionId = id;
    }
}
