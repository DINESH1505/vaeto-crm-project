package com.vaeto.crm.controller;

import com.vaeto.crm.dto.request.TaskRequest;
import com.vaeto.crm.dto.response.ApiResponse;
import com.vaeto.crm.dto.response.TaskDto;
import com.vaeto.crm.security.UserPrincipal;
import com.vaeto.crm.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskDto>>> getTasks(
            @RequestParam(required = false) String assigneeId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String filterAssignee = (assigneeId != null) ? assigneeId : (currentUser != null ? String.valueOf(currentUser.getId()) : null);
        List<TaskDto> tasks = taskService.getTasks(filterAssignee);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskDto>> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String actorId = currentUser != null ? String.valueOf(currentUser.getId()) : "system";
        TaskDto created = taskService.createTask(request, actorId);
        return ResponseEntity.ok(ApiResponse.success("Task created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> updateTask(
            @PathVariable String id,
            @Valid @RequestBody TaskRequest request
    ) {
        TaskDto updated = taskService.updateTask(id, request);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskDto>> toggleStatus(
            @PathVariable String id,
            @RequestParam(required = false) String status
    ) {
        TaskDto updated = taskService.toggleTaskStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Task status updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}
