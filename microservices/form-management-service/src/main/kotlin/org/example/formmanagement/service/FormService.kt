package org.example.formmanagement.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.example.formmanagement.dto.*
import org.example.formmanagement.model.Form
import org.example.formmanagement.repository.FormRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class FormService(
    private val formRepository: FormRepository,
    private val objectMapper: jacksonObjectMapper = jacksonObjectMapper()
) {
    
    fun createForm(createDTO: FormCreateDTO): FormResponseDTO {
        val fieldsJson = objectMapper.writeValueAsString(createDTO.fields)
        
        val form = Form(
            name = createDTO.name,
            description = createDTO.description,
            fields = fieldsJson,
            createdBy = createDTO.createdBy,
            isTemplate = createDTO.isTemplate
        )
        
        val savedForm = formRepository.save(form)
        return mapToResponseDTO(savedForm)
    }
    
    fun getFormById(id: Long): FormResponseDTO {
        val form = formRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Form not found") }
        return mapToResponseDTO(form)
    }
    
    fun getAllActiveForms(): List<FormListDTO> {
        return formRepository.findByIsActiveTrue().map { mapToListDTO(it) }
    }
    
    fun getFormsByCreator(username: String): List<FormListDTO> {
        return formRepository.findByIsActiveTrueAndCreatedBy(username).map { mapToListDTO(it) }
    }
    
    fun getFormTemplates(): List<FormListDTO> {
        return formRepository.findByIsTemplateTrue().map { mapToListDTO(it) }
    }
    
    fun searchForms(query: String): List<FormListDTO> {
        return formRepository.findByNameContainingIgnoreCase(query).map { mapToListDTO(it) }
    }
    
    fun updateForm(id: Long, updateDTO: FormUpdateDTO): FormResponseDTO {
        val form = formRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Form not found") }
        
        val updatedForm = form.copy(
            name = updateDTO.name ?: form.name,
            description = updateDTO.description ?: form.description,
            fields = if (updateDTO.fields != null) objectMapper.writeValueAsString(updateDTO.fields) else form.fields,
            isActive = updateDTO.isActive ?: form.isActive,
            isTemplate = updateDTO.isTemplate ?: form.isTemplate,
            lastModified = LocalDateTime.now()
        )
        
        val savedForm = formRepository.save(updatedForm)
        return mapToResponseDTO(savedForm)
    }
    
    fun deactivateForm(id: Long): FormResponseDTO {
        val form = formRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Form not found") }
        
        val updatedForm = form.copy(
            isActive = false,
            lastModified = LocalDateTime.now()
        )
        
        val savedForm = formRepository.save(updatedForm)
        return mapToResponseDTO(savedForm)
    }
    
    fun deleteForm(id: Long) {
        if (!formRepository.existsById(id)) {
            throw IllegalArgumentException("Form not found")
        }
        formRepository.deleteById(id)
    }
    
    private fun mapToResponseDTO(form: Form): FormResponseDTO {
        val fields = try {
            objectMapper.readValue<List<FormFieldDTO>>(form.fields)
        } catch (e: Exception) {
            emptyList()
        }
        
        return FormResponseDTO(
            id = form.id!!,
            name = form.name,
            description = form.description,
            fields = fields,
            createdBy = form.createdBy,
            createdAt = form.createdAt,
            lastModified = form.lastModified,
            isActive = form.isActive,
            isTemplate = form.isTemplate
        )
    }
    
    private fun mapToListDTO(form: Form): FormListDTO {
        return FormListDTO(
            id = form.id!!,
            name = form.name,
            description = form.description,
            createdBy = form.createdBy,
            createdAt = form.createdAt,
            isActive = form.isActive,
            isTemplate = form.isTemplate
        )
    }
}
