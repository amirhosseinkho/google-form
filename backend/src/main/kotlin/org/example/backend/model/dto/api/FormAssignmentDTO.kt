package org.example.backend.model.dto.api

data class FormAssignmentRequestDTO(
    val formId: Long,
    val groupId: Long,
    val assignedBy: String? = null
)

data class FormAssignmentResponseDTO(
    val id: Long,
    val formId: Long,
    val formName: String? = null,
    val groupId: Long,
    val groupName: String? = null,
    val assignedBy: String? = null,
    val assignedAt: String? = null,
    val isActive: Boolean = true
)

data class UserAssignedFormDTO(
    val formId: Long,
    val formName: String,
    val formDescription: String,
    val fields: List<FormFieldDTO>? = null,
    val assignedAt: String,
    val groupName: String,
    val isSubmitted: Boolean = false
) 