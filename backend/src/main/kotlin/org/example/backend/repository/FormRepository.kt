package org.example.backend.repository

import org.example.backend.model.database.Form
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface FormRepository : JpaRepository<Form, Long> {
    
    @Query("SELECT COUNT(f) FROM Form f WHERE EXISTS (SELECT 1 FROM FormSubmission fs WHERE fs.formId = f.id)")
    fun countBySubmissionsIsNotEmpty(): Long
    
    @Query("SELECT f FROM Form f ORDER BY f.createdAt DESC")
    fun findTop5ByOrderByCreatedAtDesc(): List<Form>
    
    fun findByCreatedBy(createdBy: String): List<Form>
} 