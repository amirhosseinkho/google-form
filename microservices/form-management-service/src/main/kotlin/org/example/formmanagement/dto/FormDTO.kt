package org.example.formmanagement.dto

import java.time.LocalDateTime

data class FormCreateDTO(
    val name: String,
    val description: String?,
    val fields: List<FormFieldDTO>,
    val createdBy: String,
    val isTemplate: Boolean = false
)

data class FormUpdateDTO(
    val name: String?,
    val description: String?,
    val fields: List<FormFieldDTO>?,
    val isActive: Boolean?,
    val isTemplate: Boolean?
)

data class FormResponseDTO(
    val id: Long,
    val name: String,
    val description: String?,
    val fields: List<FormFieldDTO>,
    val createdBy: String,
    val createdAt: LocalDateTime,
    val lastModified: LocalDateTime,
    val isActive: Boolean,
    val isTemplate: Boolean
)

data class FormFieldDTO(
    val fieldId: String,
    val type: String,
    val label: String,
    val isRequired: Boolean = false,
    val defaultValue: Any? = null,
    val placeholder: String? = null,
    val options: List<String>? = null,
    val fieldOrder: Int = 0
)

data class FormListDTO(
    val id: Long,
    val name: String,
    val description: String?,
    val createdBy: String,
    val createdAt: LocalDateTime,
    val isActive: Boolean,
    val isTemplate: Boolean
)
