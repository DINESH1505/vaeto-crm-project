package com.vaeto.crm.service;

import com.vaeto.crm.model.AuditLog;
import com.vaeto.crm.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(Object userId, String actorName, String action, String targetType, Object targetId, String details) {
        try {
            Long parsedUserId = null;
            if (userId instanceof Number) {
                parsedUserId = ((Number) userId).longValue();
            } else if (userId != null) {
                try {
                    parsedUserId = Long.parseLong(userId.toString());
                } catch (NumberFormatException ignored) {}
            }

            Long parsedTargetId = null;
            if (targetId instanceof Number) {
                parsedTargetId = ((Number) targetId).longValue();
            } else if (targetId != null) {
                try {
                    parsedTargetId = Long.parseLong(targetId.toString());
                } catch (NumberFormatException ignored) {}
            }

            AuditLog log = new AuditLog();
            log.setUserId(parsedUserId);
            log.setActorName(actorName);
            log.setAction(action);
            log.setResourceType(targetType != null ? targetType.toLowerCase() : "general");
            log.setResourceId(parsedTargetId);
            log.setDetails(details);
            log.setIpAddress("127.0.0.1");

            auditLogRepository.save(log);
        } catch (Exception e) {
            // Do not break the main transaction if audit logging fails
        }
    }

    public void log(String userId, String actorName, String action, String targetType, String targetId, String details) {
        log((Object) userId, actorName, action, targetType, (Object) targetId, details);
    }

    public void log(Long userId, String actorName, String action, String targetType, Long targetId, String details) {
        log((Object) userId, actorName, action, targetType, (Object) targetId, details);
    }
}
