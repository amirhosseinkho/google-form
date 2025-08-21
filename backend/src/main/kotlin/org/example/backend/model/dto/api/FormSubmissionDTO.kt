package org.example.backend.model.dto.api

data class FormSubmissionRequestDTO(
    val formId: Long,
    val userId: Long?,
    val submittedBy: String? = null,
    val submittedAt: String? = null,
    val answers: List<FormAnswerDTO>? = null
)

data class FormSubmissionResponseDTO(
    val id: Long,
    val formId: Long,
    val formName: String? = null,
    val userId: Long?,
    val userName: String? = null,
    val submittedBy: String? = null,
    val submittedAt: String? = null,
    val status: String? = null,
    val answers: List<FormAnswerDTO>? = null
)

data class FormAnswerDTO(
    val fieldId: String,
    val value: Any? = null
)

data class UserSubmissionDTO(
    val id: Long,
    val formId: Long,
    val formName: String,
    val formDescription: String? = null,
    val submittedAt: String,
    val status: String,
    val answers: List<FormAnswerDTO>? = null
)

data class FormSubmissionUpdateRequestDTO(
    val answers: List<FormAnswerDTO>? = null
) 