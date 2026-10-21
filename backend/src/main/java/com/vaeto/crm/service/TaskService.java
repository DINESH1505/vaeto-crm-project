package com.vaeto.crm.service;

import com.vaeto.crm.dto.request.TaskRequest;
import com.vaeto.crm.dto.response.TaskDto;
import com.vaeto.crm.exception.ResourceNotFoundException;
import com.vaeto.crm.model.Task;
import com.vaeto.crm.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskDto> getTasks(String assigneeId) {
        List<Task> tasks;
        if (assigneeId != null && !assigneeId.isBlank()) {
            tasks = taskRepository.findByAssigneeId(assigneeId);
        } else {
            tasks = taskRepository.findAll();
        }
        return tasks.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public TaskDto createTask(TaskRequest request, String actorId) {
        Task task = new Task();
        task.setId("tk_" + UUID.randomUUID().toString().substring(0, 8));
        task.setLeadId(request.getLeadId());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority() != null ? request.getPriority() : "Medium");
        task.setStatus(request.getStatus() != null ? request.getStatus() : "To Do");
        task.setAssigneeId(request.getAssigneeId() != null ? request.getAssigneeId() : actorId);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        return mapToDto(taskRepository.save(task));
    }

    @Transactional
    public TaskDto updateTask(String id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getLeadId() != null) task.setLeadId(request.getLeadId());
        if (request.getAssigneeId() != null) task.setAssigneeId(request.getAssigneeId());
        task.setUpdatedAt(LocalDateTime.now());

        return mapToDto(taskRepository.save(task));
    }

    @Transactional
    public TaskDto toggleTaskStatus(String id, String status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setStatus(status != null ? status : ("Done".equalsIgnoreCase(task.getStatus()) ? "To Do" : "Done"));
        task.setUpdatedAt(LocalDateTime.now());
        return mapToDto(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    public TaskDto mapToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setLeadId(task.getLeadId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus());
        dto.setAssigneeId(task.getAssigneeId());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }
}
