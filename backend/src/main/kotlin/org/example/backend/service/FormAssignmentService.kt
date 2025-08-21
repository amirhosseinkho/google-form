package org.example.backend.service

import org.example.backend.model.database.FormAssignment
import org.example.backend.model.dto.api.*
import org.example.backend.repository.FormAssignmentRepository
import org.example.backend.repository.GroupRepository
import org.example.backend.repository.GroupMemberRepository
import org.example.backend.repository.FormRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class FormAssignmentService(
    private val formAssignmentRepository: FormAssignmentRepository,
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
    private val formRepository: FormRepository
) {
    
    fun assignFormToGroup(request: FormAssignmentRequestDTO): FormAssignmentResponseDTO? {
        // Check if form exists
        val form = formRepository.findById(request.formId).orElse(null) ?: return null
        
        // Check if group exists
        val group = groupRepository.findById(request.groupId).orElse(null) ?: return null
        
        // Check if assignment already exists
        if (formAssignmentRepository.existsByFormIdAndGroupId(request.formId, request.groupId)) {
            return null
        }
        
        val assignment = FormAssignment(
            formId = request.formId,
            groupId = request.groupId,
            assignedBy = request.assignedBy ?: "unknown",
            assignedAt = LocalDateTime.now().toString(),
            isActive = true
        )
        
        val savedAssignment = formAssignmentRepository.save(assignment)
        
        return FormAssignmentResponseDTO(
            id = savedAssignment.id,
            formId = savedAssignment.formId,
            formName = form.name,
            groupId = savedAssignment.groupId,
            groupName = group.name,
            assignedBy = savedAssignment.assignedBy,
            assignedAt = savedAssignment.assignedAt,
            isActive = savedAssignment.isActive
        )
    }
    
    fun getAssignmentsByGroup(groupId: Long): List<FormAssignmentResponseDTO> {
        val assignments = formAssignmentRepository.findByGroupId(groupId)
        return assignments.mapNotNull { assignment ->
            val form = formRepository.findById(assignment.formId).orElse(null) ?: return@mapNotNull null
            val group = groupRepository.findById(assignment.groupId).orElse(null) ?: return@mapNotNull null
            
            FormAssignmentResponseDTO(
                id = assignment.id,
                formId = assignment.formId,
                formName = form.name,
                groupId = assignment.groupId,
                groupName = group.name,
                assignedBy = assignment.assignedBy,
                assignedAt = assignment.assignedAt,
                isActive = assignment.isActive
            )
        }
    }
    
    fun getAssignmentsByForm(formId: Long): List<FormAssignmentResponseDTO> {
        val assignments = formAssignmentRepository.findByFormId(formId)
        return assignments.mapNotNull { assignment ->
            val form = formRepository.findById(assignment.formId).orElse(null) ?: return@mapNotNull null
            val group = groupRepository.findById(assignment.groupId).orElse(null) ?: return@mapNotNull null
            
            FormAssignmentResponseDTO(
                id = assignment.id,
                formId = assignment.formId,
                formName = form.name,
                groupId = assignment.groupId,
                groupName = group.name,
                assignedBy = assignment.assignedBy,
                assignedAt = assignment.assignedAt,
                isActive = assignment.isActive
            )
        }
    }
    
    fun removeAssignment(assignmentId: Long): Boolean {
        val assignment = formAssignmentRepository.findById(assignmentId).orElse(null) ?: return false
        assignment.copy(isActive = false)
        formAssignmentRepository.save(assignment)
        return true
    }
    
    fun getUserAssignedForms(userId: Long): List<UserAssignedFormDTO> {
        // Get all groups where user is a member
        val userGroups = groupMemberRepository.findByUserId(userId)
        val groupIds = userGroups.map { it.groupId }
        
        if (groupIds.isEmpty()) {
            return emptyList()
        }
        
        // Get all form IDs assigned to these groups
        val formIds = formAssignmentRepository.findFormIdsByGroupIds(groupIds)
        
        if (formIds.isEmpty()) {
            return emptyList()
        }
        
        // Get form details and group names
        return formIds.mapNotNull { formId ->
            val form = formRepository.findById(formId).orElse(null) ?: return@mapNotNull null
            
            // Find which group this form is assigned to for this user
            val assignment = formAssignmentRepository.findByFormId(formId)
                .find { assignment -> groupIds.contains(assignment.groupId) } ?: return@mapNotNull null
            
            val group = groupRepository.findById(assignment.groupId).orElse(null) ?: return@mapNotNull null
            
            UserAssignedFormDTO(
                formId = form.id,
                formName = form.name,
                formDescription = form.description,
                fields = null, // Will be loaded separately if needed
                assignedAt = assignment.assignedAt,
                groupName = group.name,
                isSubmitted = false // TODO: Check if user has submitted this form
            )
        }
    }
} 