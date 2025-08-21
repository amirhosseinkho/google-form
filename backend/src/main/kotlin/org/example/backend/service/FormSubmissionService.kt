package org.example.backend.service

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.example.backend.model.database.FormSubmission
import org.example.backend.model.database.UserModel
import org.example.backend.model.database.Form
import org.example.backend.model.dto.api.*
import org.example.backend.model.dto.api.FormSubmissionUpdateRequestDTO
import org.example.backend.repository.FormSubmissionRepository
import org.example.backend.repository.userManagement.UserRepository
import org.example.backend.repository.FormRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class FormSubmissionService(
    private val formSubmissionRepository: FormSubmissionRepository,
    private val userRepository: UserRepository,
    private val formRepository: FormRepository
) {
    private val objectMapper = ObjectMapper()
    
    fun submitForm(request: FormSubmissionRequestDTO): FormSubmissionResponseDTO? {
        try {
            // Debug: Print the request data
            println("DEBUG: FormSubmissionRequest - formId: ${request.formId}")
            println("DEBUG: FormSubmissionRequest - userId: ${request.userId}")
            println("DEBUG: FormSubmissionRequest - submittedBy: '${request.submittedBy}'")
            println("DEBUG: FormSubmissionRequest - submittedAt: ${request.submittedAt}")
            println("DEBUG: FormSubmissionRequest - answers count: ${request.answers?.size ?: 0}")
            
            // Check if form exists
            val form = formRepository.findById(request.formId).orElse(null) ?: return null
            
            // Serialize answers to JSON
            val answersJson = if (request.answers != null) {
                objectMapper.writeValueAsString(request.answers)
            } else {
                "[]"
            }
            
            val finalSubmittedBy = if (request.submittedBy.isNullOrEmpty() || request.submittedBy == "unknown" || request.submittedBy == "Unknown User") {
                println("DEBUG: Using 'Unknown User' as submittedBy")
                "Unknown User"
            } else {
                println("DEBUG: Using '${request.submittedBy}' as submittedBy")
                request.submittedBy
            }
            
            val submission = FormSubmission(
                formId = request.formId,
                userId = request.userId,
                submittedBy = finalSubmittedBy,
                submittedAt = request.submittedAt ?: LocalDateTime.now().toString(),
                answers = answersJson
            )
            
            val savedSubmission = formSubmissionRepository.save(submission)
            
            return FormSubmissionResponseDTO(
                id = savedSubmission.id,
                formId = savedSubmission.formId,
                formName = form.name,
                userId = savedSubmission.userId,
                userName = savedSubmission.submittedBy,
                submittedBy = savedSubmission.submittedBy,
                submittedAt = savedSubmission.submittedAt,
                status = "SUCCESS",
                answers = request.answers
            )
        } catch (e: Exception) {
            println("Error submitting form: ${e.message}")
            e.printStackTrace()
            return null
        }
    }
    
    fun getUserSubmissions(userId: Long): List<UserSubmissionDTO> {
        val submissions = formSubmissionRepository.findByUserId(userId)
        return submissions.mapNotNull { submission ->
            val form = formRepository.findById(submission.formId).orElse(null) ?: return@mapNotNull null
            UserSubmissionDTO(
                id = submission.id,
                formId = submission.formId,
                formName = form.name,
                formDescription = form.description,
                submittedAt = submission.submittedAt,
                status = "SUCCESS",
                answers = try {
                    objectMapper.readValue(submission.answers, object : TypeReference<List<FormAnswerDTO>>() {})
                } catch (e: Exception) {
                    emptyList()
                }
            )
        }
    }
    
    fun getFormSubmissions(formId: Long): List<FormSubmissionResponseDTO> {
        val submissions = formSubmissionRepository.findByFormId(formId)
        return submissions.mapNotNull { submission ->
            val form = formRepository.findById(submission.formId).orElse(null) ?: return@mapNotNull null
            FormSubmissionResponseDTO(
                id = submission.id,
                formId = submission.formId,
                formName = form.name,
                userId = submission.userId,
                userName = submission.submittedBy,
                submittedBy = submission.submittedBy,
                submittedAt = submission.submittedAt,
                status = "SUCCESS",
                answers = try {
                    objectMapper.readValue(submission.answers, object : TypeReference<List<FormAnswerDTO>>() {})
                } catch (e: Exception) {
                    emptyList()
                }
            )
        }
    }
    
    fun getSubmissionById(submissionId: Long): FormSubmissionResponseDTO? {
        val submission = formSubmissionRepository.findById(submissionId).orElse(null) ?: return null
        val form = formRepository.findById(submission.formId).orElse(null) ?: return null
        
        val answers = try {
            objectMapper.readValue(submission.answers, object : TypeReference<List<FormAnswerDTO>>() {})
        } catch (e: Exception) {
            emptyList()
        }
        
        return FormSubmissionResponseDTO(
            id = submission.id,
            formId = submission.formId,
            formName = form.name,
            userId = submission.userId,
            userName = submission.submittedBy,
            submittedBy = submission.submittedBy,
            submittedAt = submission.submittedAt,
            status = "SUCCESS",
            answers = answers
        )
    }
    
    fun updateSubmission(submissionId: Long, request: FormSubmissionUpdateRequestDTO): FormSubmissionResponseDTO? {
        try {
            val submission = formSubmissionRepository.findById(submissionId).orElse(null) ?: return null
            val form = formRepository.findById(submission.formId).orElse(null) ?: return null
            
            // Serialize updated answers to JSON
            val answersJson = if (request.answers != null) {
                objectMapper.writeValueAsString(request.answers)
            } else {
                submission.answers
            }
            
            // Update the submission
            val updatedSubmission = submission.copy(
                answers = answersJson,
                submittedAt = LocalDateTime.now().toString() // Update submission time
            )
            
            val savedSubmission = formSubmissionRepository.save(updatedSubmission)
            
            return FormSubmissionResponseDTO(
                id = savedSubmission.id,
                formId = savedSubmission.formId,
                formName = form.name,
                userId = savedSubmission.userId,
                userName = savedSubmission.submittedBy,
                submittedBy = savedSubmission.submittedBy,
                submittedAt = savedSubmission.submittedAt,
                status = "UPDATED",
                answers = request.answers
            )
        } catch (e: Exception) {
            println("Error updating submission: ${e.message}")
            e.printStackTrace()
            return null
        }
    }
    
    fun deleteSubmission(submissionId: Long): Boolean {
        val submission = formSubmissionRepository.findById(submissionId).orElse(null) ?: return false
        formSubmissionRepository.delete(submission)
        return true
    }
    
    fun getUserSubmissionCount(userId: Long): Long {
        return formSubmissionRepository.countByUserId(userId)
    }
    
    fun getFormSubmissionCount(formId: Long): Long {
        return formSubmissionRepository.countByFormId(formId)
    }
} 