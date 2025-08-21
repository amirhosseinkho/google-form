package org.example.formmanagement.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "forms", schema = "form_management")
data class Form(
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(nullable = false)
    val name: String,
    
    @Column(columnDefinition = "TEXT")
    val description: String? = null,
    
    @Column(columnDefinition = "TEXT", nullable = false)
    val fields: String, // JSON string of FormFieldDTO
    
    @Column(name = "created_by", nullable = false)
    val createdBy: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "last_modified", nullable = false)
    val lastModified: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true,
    
    @Column(name = "is_template", nullable = false)
    val isTemplate: Boolean = false
)

@Entity
@Table(name = "form_fields", schema = "form_management")
data class FormField(
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(name = "form_id", nullable = false)
    val formId: Long,
    
    @Column(nullable = false)
    val fieldId: String,
    
    @Column(nullable = false)
    val type: String,
    
    @Column(nullable = false)
    val label: String,
    
    @Column(name = "is_required", nullable = false)
    val isRequired: Boolean = false,
    
    @Column(name = "default_value", columnDefinition = "TEXT")
    val defaultValue: String? = null,
    
    @Column(columnDefinition = "TEXT")
    val placeholder: String? = null,
    
    @Column(columnDefinition = "TEXT")
    val options: String? = null, // JSON array for dropdown/checkbox/radio
    
    @Column(name = "field_order", nullable = false)
    val fieldOrder: Int = 0
)
