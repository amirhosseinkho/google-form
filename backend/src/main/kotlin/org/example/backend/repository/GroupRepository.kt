package org.example.backend.repository

import org.example.backend.model.database.Group
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GroupRepository : JpaRepository<Group, Long> {
    fun findByName(name: String): Group?
    fun existsByName(name: String): Boolean
    fun findByCreatedBy(createdBy: String): List<Group>
} 