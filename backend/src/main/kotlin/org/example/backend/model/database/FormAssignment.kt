package org.example.backend.model.database

import jakarta.persistence.*

@Entity
@Table(name = "form_assignments")
data class FormAssignment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val formId: Long,

    @Column(nullable = false)
    val groupId: Long,

    @Column(nullable = false)
    val assignedBy: String = "unknown",

    @Column(nullable = false)
    val assignedAt: String = java.time.LocalDateTime.now().toString(),

    @Column(nullable = false)
    val isActive: Boolean = true
) 