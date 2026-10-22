package com.vaeto.crm.repository;

import com.vaeto.crm.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, String> {

    List<Meeting> findByOwnerId(String ownerId);

    @Query(value = "SELECT COUNT(*) FROM meetings WHERE LOWER(status) = LOWER(:status)", nativeQuery = true)
    long countByStatus(@Param("status") String status);

    @Query(value = "SELECT COUNT(*) FROM meetings WHERE meeting_date = :date", nativeQuery = true)
    long countByDate(@Param("date") String date);

    @Query(value = "SELECT * FROM meetings WHERE " +
           "(:ownerId IS NULL OR created_by = :ownerId) AND " +
           "(:startDate IS NULL OR meeting_date >= :startDate) AND " +
           "(:endDate IS NULL OR meeting_date <= :endDate) " +
           "ORDER BY meeting_date ASC, start_time ASC", nativeQuery = true)
    List<Meeting> findByDateRange(
            @Param("ownerId") String ownerId,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );
}
