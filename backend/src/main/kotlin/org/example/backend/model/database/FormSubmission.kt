package org.example.backend.model.database

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "form_submissions")
data class FormSubmission(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val formId: Long,

    @Column(nullable = true)
    val userId: Long?,

    @Column(nullable = false)
    val submittedBy: String,

    @Column(nullable = false)
    val submittedAt: String,

    @Column(columnDefinition = "TEXT")
    val answers: String  // JSON string of answers
)
