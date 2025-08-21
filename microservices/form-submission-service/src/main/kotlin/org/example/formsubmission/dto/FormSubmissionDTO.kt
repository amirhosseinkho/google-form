package org.example.formsubmission.dto

import java.time.LocalDateTime

data class FormSubmissionCreateDTO(
    val formId: Long,
    val userId: Long,
    val submittedBy: String,
    val answers: Map<String, Any>,
    val isDraft: Boolean = false
)

data class FormSubmissionUpdateDTO(
    val answers: Map<String, Any>?,
    val isDraft: Boolean?,
    val isActive: Boolean?
)

data class FormSubmissionResponseDTO(
    val id: Long,
    val formId: Long,
    val userId: Long,
    val submittedBy: String,
    val submittedAt: LocalDateTime,
    val answers: Map<String, Any>,
    val isDraft: Boolean,
    val lastModified: LocalDateTime,
    val isActive: Boolean
)

data class FormSubmissionListDTO(
    val id: Long,
    val formId: Long,
    val userId: Long,
    val submittedBy: String,
    val submittedAt: LocalDateTime,
    val isDraft: Boolean,
    val isActive: Boolean
)

data class FormAssignmentCreateDTO(
    val formId: Long,
    val groupId: Long,
    val assignedBy: String,
    val dueDate: LocalDateTime? = null
)

data class FormAssignmentResponseDTO(
    val id: Long,
    val formId: Long,
    val groupId: Long,
    val assignedBy: String,
    val assignedAt: LocalDateTime,
    val dueDate: LocalDateTime?,
    val isActive: Boolean
)

data class FormAssignmentListDTO(
    val id: Long,
    val formId: Long,
    val groupId: Long,
    val assignedBy: String,
    val assignedAt: LocalDateTime,
    val dueDate: LocalDateTime?,
    val isActive: Boolean
)
