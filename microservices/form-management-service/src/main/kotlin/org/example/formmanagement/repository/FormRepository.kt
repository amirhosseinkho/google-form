package org.example.formmanagement.repository

import org.example.formmanagement.model.Form
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FormRepository : JpaRepository<Form, Long> {
    fun findByIsActiveTrue(): List<Form>
    fun findByCreatedBy(username: String): List<Form>
    fun findByIsTemplateTrue(): List<Form>
    fun findByNameContainingIgnoreCase(name: String): List<Form>
    fun findByIsActiveTrueAndCreatedBy(username: String): List<Form>
}
