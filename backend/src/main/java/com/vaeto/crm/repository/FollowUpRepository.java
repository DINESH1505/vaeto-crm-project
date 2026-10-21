package com.vaeto.crm.repository;

import com.vaeto.crm.model.FollowUp;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, String> {

    List<FollowUp> findByOwnerId(String ownerId);

    Page<FollowUp> findByOwnerId(String ownerId, Pageable pageable);

    List<FollowUp> findTop10ByStatusOrderByDateAsc(String status);

    long countByStatus(String status);
}
