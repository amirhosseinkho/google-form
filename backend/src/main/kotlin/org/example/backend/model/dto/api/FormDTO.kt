package org.example.backend.model.dto.api

data class FormRequestDTO(
    val name: String,
    val description: String,
    val fields: List<FormFieldDTO>? = null,
    val createdBy: String? = null
)

data class FormResponseDTO(
    val id: Long,
    val name: String,
    val description: String,
    val fields: List<FormFieldDTO>? = null,
    val createdBy: String? = null,
    val createdAt: String? = null,
    val lastModified: String? = null
)

data class FormFieldDTO(
    val id: String,
    val type: String,
    val label: String,
    val required: Boolean,
    val defaultValue: Any? = null,
    val placeholder: String? = null,
    val options: List<String>? = null,
    val min: Double? = null,
    val max: Double? = null,
    val minDate: String? = null,
    val maxDate: String? = null
) 