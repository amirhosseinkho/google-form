package org.example.formsubmission.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "form_submissions", schema = "form_submission")
data class FormSubmission(
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(name = "form_id", nullable = false)
    val formId: Long,
    
    @Column(name = "user_id", nullable = false)
    val userId: Long,
    
    @Column(name = "submitted_by", nullable = false)
    val submittedBy: String,
    
    @Column(name = "submitted_at", nullable = false)
    val submittedAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(columnDefinition = "TEXT", nullable = false)
    val answers: String, // JSON string of answers
    
    @Column(name = "is_draft", nullable = false)
    val isDraft: Boolean = false,
    
    @Column(name = "last_modified", nullable = false)
    val lastModified: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true
)

@Entity
@Table(name = "form_assignments", schema = "form_submission")
data class FormAssignment(
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(name = "form_id", nullable = false)
    val formId: Long,
    
    @Column(name = "group_id", nullable = false)
    val groupId: Long,
    
    @Column(name = "assigned_by", nullable = false)
    val assignedBy: String,
    
    @Column(name = "assigned_at", nullable = false)
    val assignedAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "due_date")
    val dueDate: LocalDateTime? = null,
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true
)
