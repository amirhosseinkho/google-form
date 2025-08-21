package org.example.backend.service

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.example.backend.model.database.Form
import org.example.backend.model.dto.api.FormRequestDTO
import org.example.backend.model.dto.api.FormResponseDTO
import org.example.backend.model.dto.api.FormFieldDTO
import org.example.backend.repository.FormRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class FormService(
    private val formRepository: FormRepository
) {
    private val objectMapper = ObjectMapper().apply {
        registerKotlinModule()
    }

    fun getAllForms(): List<FormResponseDTO> {
        val forms = formRepository.findAll()
        return forms.map { form ->
            FormResponseDTO(
                id = form.id,
                name = form.name,
                description = form.description,
                fields = parseFieldsFromJson(form.fields),
                createdBy = if (form.createdBy.isNotEmpty() && form.createdBy != "unknown" && form.createdBy != "Unknown Creator") form.createdBy else "Unknown Creator",
                createdAt = form.createdAt,
                lastModified = form.lastModified
            )
        }
    }

    fun getFormsByUserId(userId: Long): List<FormResponseDTO> {
        // For now, we'll get the user's email from localStorage in frontend
        // and pass it as createdBy parameter
        // In a real application, you'd want to join with the user table
        
        val forms = formRepository.findAll()
        return forms.filter { form ->
            // Filter forms where createdBy is not empty and not default values
            form.createdBy.isNotEmpty() && 
            form.createdBy != "unknown" && 
            form.createdBy != "Unknown Creator"
        }.map { form ->
            FormResponseDTO(
                id = form.id,
                name = form.name,
                description = form.description,
                fields = parseFieldsFromJson(form.fields),
                createdBy = form.createdBy,
                createdAt = form.createdAt,
                lastModified = form.lastModified
            )
        }
    }

    fun getFormsByUserEmail(userEmail: String): List<FormResponseDTO> {
        val forms = formRepository.findByCreatedBy(userEmail)
        return forms.map { form ->
            FormResponseDTO(
                id = form.id,
                name = form.name,
                description = form.description,
                fields = parseFieldsFromJson(form.fields),
                createdBy = form.createdBy,
                createdAt = form.createdAt,
                lastModified = form.lastModified
            )
        }
    }

    fun getFormById(id: Long): FormResponseDTO? {
        val form = formRepository.findById(id).orElse(null) ?: return null
        return FormResponseDTO(
            id = form.id,
            name = form.name,
            description = form.description,
            fields = parseFieldsFromJson(form.fields),
            createdBy = if (form.createdBy.isNotEmpty() && form.createdBy != "unknown" && form.createdBy != "Unknown Creator") form.createdBy else "Unknown Creator",
            createdAt = form.createdAt,
            lastModified = form.lastModified
        )
    }

    fun createForm(request: FormRequestDTO): FormResponseDTO {
        val fieldsJson = serializeFieldsToJson(request.fields)
        
        // Debug: Print the createdBy value
        println("DEBUG: Request createdBy: '${request.createdBy}'")
        println("DEBUG: Request createdBy is null: ${request.createdBy == null}")
        println("DEBUG: Request createdBy is empty: ${request.createdBy?.isEmpty()}")
        
        val finalCreatedBy = if (request.createdBy.isNullOrEmpty() || request.createdBy == "unknown" || request.createdBy == "Unknown Creator") {
            println("DEBUG: Using 'Unknown Creator' as createdBy")
            "Unknown Creator"
        } else {
            println("DEBUG: Using '${request.createdBy}' as createdBy")
            request.createdBy
        }
        
        val form = Form(
            name = request.name,
            description = request.description,
            fields = fieldsJson,
            createdBy = finalCreatedBy,
            createdAt = LocalDateTime.now().toString(),
            lastModified = LocalDateTime.now().toString()
        )
        
        val savedForm = formRepository.save(form)
        
        return FormResponseDTO(
            id = savedForm.id,
            name = savedForm.name,
            description = savedForm.description,
            fields = request.fields ?: emptyList(),
            createdBy = savedForm.createdBy,
            createdAt = savedForm.createdAt,
            lastModified = savedForm.lastModified
        )
    }

    fun updateForm(id: Long, request: FormRequestDTO): FormResponseDTO? {
        val existingForm = formRepository.findById(id).orElse(null) ?: return null
        
        val fieldsJson = if (request.fields != null && request.fields.isNotEmpty()) {
            serializeFieldsToJson(request.fields)
        } else {
            existingForm.fields
        }
        
        val updatedForm = existingForm.copy(
            name = request.name ?: existingForm.name,
            description = request.description ?: existingForm.description,
            fields = fieldsJson,
            lastModified = LocalDateTime.now().toString()
        )
        
        val savedForm = formRepository.save(updatedForm)
        
        return FormResponseDTO(
            id = savedForm.id,
            name = savedForm.name,
            description = savedForm.description,
            fields = parseFieldsFromJson(savedForm.fields),
            createdBy = savedForm.createdBy,
            createdAt = savedForm.createdAt,
            lastModified = savedForm.lastModified
        )
    }

    fun deleteForm(id: Long): Boolean {
        if (!formRepository.existsById(id)) {
            return false
        }
        formRepository.deleteById(id)
        return true
    }

    private fun serializeFieldsToJson(fields: List<FormFieldDTO>?): String? {
        return if (fields != null && fields.isNotEmpty()) {
            try {
                objectMapper.writeValueAsString(fields)
            } catch (e: Exception) {
                println("Error serializing fields: ${e.message}")
                null
            }
        } else {
            null
        }
    }

    private fun parseFieldsFromJson(fieldsJson: String?): List<FormFieldDTO> {
        return if (fieldsJson != null && fieldsJson.isNotEmpty()) {
            try {
                val typeRef = object : TypeReference<List<FormFieldDTO>>() {}
                objectMapper.readValue(fieldsJson, typeRef)
            } catch (e: Exception) {
                println("Error parsing fields: ${e.message}")
                emptyList()
            }
        } else {
            emptyList()
        }
    }
} 