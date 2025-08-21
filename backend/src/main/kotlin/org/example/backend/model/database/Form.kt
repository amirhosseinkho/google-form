package org.example.backend.model.database

import jakarta.persistence.*

@Entity
@Table(name = "forms")
data class Form(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val name: String,

    @Column(nullable = false)
    val description: String,

    @Column(columnDefinition = "TEXT")
    val fields: String? = null,

    @Column(nullable = false)
    val createdBy: String = "unknown",

    @Column(nullable = false)
    val createdAt: String = java.time.LocalDateTime.now().toString(),

    @Column(nullable = false)
    val lastModified: String = java.time.LocalDateTime.now().toString()
)
