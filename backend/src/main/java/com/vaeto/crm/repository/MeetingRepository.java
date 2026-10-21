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

    long countByStatus(String status);

    long countByDate(String date);

    @Query("SELECT m FROM Meeting m WHERE " +
           "(:ownerId IS NULL OR m.ownerId = :ownerId) AND " +
           "(:startDate IS NULL OR m.date >= :startDate) AND " +
           "(:endDate IS NULL OR m.date <= :endDate) " +
           "ORDER BY m.date ASC, m.time ASC")
    List<Meeting> findByDateRange(
            @Param("ownerId") String ownerId,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );
}
