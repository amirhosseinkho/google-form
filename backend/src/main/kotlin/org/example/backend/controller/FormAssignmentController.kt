package org.example.backend.controller

import org.example.backend.model.dto.api.*
import org.example.backend.service.FormAssignmentService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/form-assignments")
class FormAssignmentController(
    private val formAssignmentService: FormAssignmentService
) {

    @PostMapping
    fun assignFormToGroup(@RequestBody request: FormAssignmentRequestDTO): ResponseEntity<FormAssignmentResponseDTO> {
        try {
            val assignment = formAssignmentService.assignFormToGroup(request)
            return if (assignment != null) {
                ResponseEntity.ok(assignment)
            } else {
                ResponseEntity.badRequest().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/group/{groupId}")
    fun getAssignmentsByGroup(@PathVariable groupId: Long): ResponseEntity<List<FormAssignmentResponseDTO>> {
        try {
            val assignments = formAssignmentService.getAssignmentsByGroup(groupId)
            return ResponseEntity.ok(assignments)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }

    @GetMapping("/form/{formId}")
    fun getAssignmentsByForm(@PathVariable formId: Long): ResponseEntity<List<FormAssignmentResponseDTO>> {
        try {
            val assignments = formAssignmentService.getAssignmentsByForm(formId)
            return ResponseEntity.ok(assignments)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }

    @DeleteMapping("/{assignmentId}")
    fun removeAssignment(@PathVariable assignmentId: Long): ResponseEntity<Void> {
        try {
            val removed = formAssignmentService.removeAssignment(assignmentId)
            return if (removed) {
                ResponseEntity.ok().build()
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/user/{userId}/assigned-forms")
    fun getUserAssignedForms(@PathVariable userId: Long): ResponseEntity<List<UserAssignedFormDTO>> {
        try {
            val forms = formAssignmentService.getUserAssignedForms(userId)
            return ResponseEntity.ok(forms)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }
} 