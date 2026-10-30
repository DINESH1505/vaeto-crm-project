package com.vaeto.crm.repository;

import com.vaeto.crm.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findByCreatedBy(Long createdBy);

    List<Meeting> findByLeadId(Long leadId);

    @Query("SELECT m FROM Meeting m WHERE m.leadId = :leadId AND LOWER(m.status) != 'cancelled' ORDER BY m.meetingDate ASC, m.startTime ASC")
    List<Meeting> findActiveByLeadId(@Param("leadId") Long leadId);

    @Query(value = "SELECT COUNT(*) FROM meetings WHERE LOWER(status) = LOWER(:status)", nativeQuery = true)
    long countByStatus(@Param("status") String status);

    @Query(value = "SELECT COUNT(*) FROM meetings WHERE meeting_date = :date AND LOWER(status) NOT IN ('cancelled', 'completed')", nativeQuery = true)
    long countByDate(@Param("date") LocalDate date);

    @Query(value = "SELECT COUNT(*) FROM meetings WHERE meeting_date = :date AND LOWER(status) = 'completed'", nativeQuery = true)
    long countCompletedByDate(@Param("date") LocalDate date);

    @Query("SELECT m FROM Meeting m WHERE " +
           "(:createdBy IS NULL OR m.createdBy = :createdBy) AND " +
           "(:startDate IS NULL OR m.meetingDate >= :startDate) AND " +
           "(:endDate IS NULL OR m.meetingDate <= :endDate) " +
           "ORDER BY m.meetingDate ASC, m.startTime ASC")
    List<Meeting> findByDateRange(
            @Param("createdBy") Long createdBy,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
