package com.vaeto.crm.repository;

import com.vaeto.crm.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    List<Task> findByAssigneeId(String assigneeId);

    Page<Task> findByAssigneeId(String assigneeId, Pageable pageable);

    long countByStatus(String status);
}
