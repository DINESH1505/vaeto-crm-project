package com.vaeto.crm.repository;

import com.vaeto.crm.model.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    long countByStatus(String status);

    @Query("SELECT COUNT(l) FROM Lead l WHERE (l.isDeleted IS NULL OR l.isDeleted = false)")
    long countActive();

    @Query("SELECT l FROM Lead l WHERE " +
           "(:includeDeleted = true OR l.isDeleted IS NULL OR l.isDeleted = false) AND " +
           "(:ownerId IS NULL OR l.assignedTo = :ownerId OR l.createdBy = :ownerId) AND " +
           "(:status IS NULL OR LOWER(l.status) = LOWER(:status)) AND " +
           "(:search IS NULL OR LOWER(l.company) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.contactName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.phone) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Lead> findFiltered(
            @Param("ownerId") Long ownerId,
            @Param("status") String status,
            @Param("search") String search,
            @Param("includeDeleted") boolean includeDeleted,
            Pageable pageable
    );

    @Query("SELECT l.status, COUNT(l) FROM Lead l WHERE (l.isDeleted IS NULL OR l.isDeleted = false) GROUP BY l.status")
    List<Object[]> countByStatusGrouped();
}
