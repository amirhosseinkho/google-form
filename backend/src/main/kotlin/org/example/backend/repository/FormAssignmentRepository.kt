package org.example.backend.repository

import org.example.backend.model.database.FormAssignment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface FormAssignmentRepository : JpaRepository<FormAssignment, Long> {
    
    @Query("SELECT fa FROM FormAssignment fa WHERE fa.groupId = :groupId AND fa.isActive = true")
    fun findByGroupId(@Param("groupId") groupId: Long): List<FormAssignment>
    
    @Query("SELECT fa FROM FormAssignment fa WHERE fa.formId = :formId AND fa.isActive = true")
    fun findByFormId(@Param("formId") formId: Long): List<FormAssignment>
    
    fun existsByFormIdAndGroupId(formId: Long, groupId: Long): Boolean
    
    @Query("SELECT DISTINCT fa.formId FROM FormAssignment fa WHERE fa.groupId IN :groupIds AND fa.isActive = true")
    fun findFormIdsByGroupIds(@Param("groupIds") groupIds: List<Long>): List<Long>
} 