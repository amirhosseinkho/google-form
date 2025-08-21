package org.example.backend.controller

import org.example.backend.model.dto.api.*
import org.example.backend.service.FormSubmissionService
import org.example.backend.service.FormService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/form-submissions")
class FormSubmissionController(
    private val formSubmissionService: FormSubmissionService,
    private val formService: FormService
) {

    @PostMapping
    fun submitForm(@RequestBody request: FormSubmissionRequestDTO): ResponseEntity<FormSubmissionResponseDTO> {
        try {
            val submission = formSubmissionService.submitForm(request)
            return if (submission != null) {
                ResponseEntity.ok(submission)
            } else {
                ResponseEntity.badRequest().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/user/{userId}")
    fun getUserSubmissions(@PathVariable userId: Long): ResponseEntity<List<UserSubmissionDTO>> {
        try {
            val submissions = formSubmissionService.getUserSubmissions(userId)
            return ResponseEntity.ok(submissions)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }

    @GetMapping("/form/{formId}")
    fun getFormSubmissions(@PathVariable formId: Long, @RequestParam(required = false) userEmail: String?): ResponseEntity<List<FormSubmissionResponseDTO>> {
        try {
            // Check if user has access to this form
            if (userEmail != null) {
                val form = formService.getFormById(formId)
                if (form == null) {
                    return ResponseEntity.notFound().build()
                }
                if (form.createdBy != userEmail) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val submissions = formSubmissionService.getFormSubmissions(formId)
            return ResponseEntity.ok(submissions)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }

    @GetMapping("/{submissionId}")
    fun getSubmissionById(@PathVariable submissionId: Long): ResponseEntity<FormSubmissionResponseDTO> {
        try {
            val submission = formSubmissionService.getSubmissionById(submissionId)
            return if (submission != null) {
                ResponseEntity.ok(submission)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @PutMapping("/{submissionId}")
    fun updateSubmission(@PathVariable submissionId: Long, @RequestBody request: FormSubmissionUpdateRequestDTO): ResponseEntity<FormSubmissionResponseDTO> {
        try {
            val updatedSubmission = formSubmissionService.updateSubmission(submissionId, request)
            return if (updatedSubmission != null) {
                ResponseEntity.ok(updatedSubmission)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @DeleteMapping("/{submissionId}")
    fun deleteSubmission(@PathVariable submissionId: Long, @RequestParam(required = false) userEmail: String?): ResponseEntity<Void> {
        try {
            // Check if user has access to delete this submission
            if (userEmail != null) {
                val submission = formSubmissionService.getSubmissionById(submissionId)
                if (submission == null) {
                    return ResponseEntity.notFound().build()
                }
                val form = formService.getFormById(submission.formId)
                if (form == null) {
                    return ResponseEntity.notFound().build()
                }
                if (form.createdBy != userEmail) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val deleted = formSubmissionService.deleteSubmission(submissionId)
            return if (deleted) {
                ResponseEntity.ok().build()
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/user/{userId}/count")
    fun getUserSubmissionCount(@PathVariable userId: Long): ResponseEntity<Long> {
        try {
            val count = formSubmissionService.getUserSubmissionCount(userId)
            return ResponseEntity.ok(count)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(0L)
        }
    }

    @GetMapping("/form/{formId}/count")
    fun getFormSubmissionCount(@PathVariable formId: Long): ResponseEntity<Long> {
        try {
            val count = formSubmissionService.getFormSubmissionCount(formId)
            return ResponseEntity.ok(count)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(0L)
        }
    }
} 