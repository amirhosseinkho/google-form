package org.example.backend.repository

import org.example.backend.model.database.FormSubmission
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface FormSubmissionRepository : JpaRepository<FormSubmission, Long> {
    
    @Query("SELECT fs FROM FormSubmission fs WHERE fs.userId = :userId")
    fun findByUserId(@Param("userId") userId: Long): List<FormSubmission>
    
    @Query("SELECT fs FROM FormSubmission fs WHERE fs.formId = :formId")
    fun findByFormId(@Param("formId") formId: Long): List<FormSubmission>
    
    @Query("SELECT fs FROM FormSubmission fs WHERE fs.userId = :userId AND fs.formId = :formId")
    fun findByUserIdAndFormId(@Param("userId") userId: Long, @Param("formId") formId: Long): List<FormSubmission>
    
    @Query("SELECT COUNT(fs) FROM FormSubmission fs WHERE fs.formId = :formId")
    fun countByFormId(@Param("formId") formId: Long): Long
    
    @Query("SELECT COUNT(fs) FROM FormSubmission fs WHERE fs.userId = :userId")
    fun countByUserId(@Param("userId") userId: Long): Long
    
    @Query("SELECT COUNT(fs) FROM FormSubmission fs WHERE fs.formId IN :formIds")
    fun countByFormIdIn(@Param("formIds") formIds: List<Long>): Long
    
    @Query("SELECT fs FROM FormSubmission fs WHERE fs.formId IN :formIds")
    fun findByFormIdIn(@Param("formIds") formIds: List<Long>): List<FormSubmission>
    
    @Query("SELECT fs FROM FormSubmission fs WHERE fs.formId = :formId ORDER BY fs.submittedAt DESC")
    fun findTopByFormIdOrderBySubmittedAtDesc(@Param("formId") formId: Long): FormSubmission?
    
    @Query("SELECT fs FROM FormSubmission fs ORDER BY fs.submittedAt DESC")
    fun findTop10ByOrderBySubmittedAtDesc(): List<FormSubmission>
} 