package com.vaeto.crm.repository;

import com.vaeto.crm.model.FollowUp;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {

    boolean existsByLeadId(Long leadId);

    List<FollowUp> findByLeadId(Long leadId);

    List<FollowUp> findByResponsibleUserId(Long responsibleUserId);

    Page<FollowUp> findByResponsibleUserId(Long responsibleUserId, Pageable pageable);

    @Query(value = "SELECT * FROM follow_ups WHERE status = 'Pending' AND scheduled_date >= CURRENT_DATE() ORDER BY scheduled_date ASC LIMIT 10", nativeQuery = true)
    List<FollowUp> findUpcomingPending();

    @Query(value = "SELECT * FROM follow_ups WHERE LOWER(status) = LOWER(:status) ORDER BY scheduled_date ASC LIMIT 10", nativeQuery = true)
    List<FollowUp> findTop10ByStatusOrderByDateAsc(@Param("status") String status);

    @Query(value = "SELECT COUNT(*) FROM follow_ups WHERE LOWER(status) = 'pending'", nativeQuery = true)
    long countPending();

    @Query(value = "SELECT COUNT(*) FROM follow_ups WHERE LOWER(status) = LOWER(:status)", nativeQuery = true)
    long countByStatus(@Param("status") String status);
}
