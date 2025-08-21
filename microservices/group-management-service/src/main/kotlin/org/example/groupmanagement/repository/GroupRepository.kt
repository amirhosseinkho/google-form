package org.example.groupmanagement.repository

import org.example.groupmanagement.model.Group
import org.example.groupmanagement.model.GroupMember
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface GroupRepository : JpaRepository<Group, Long> {
    fun findByIsActiveTrue(): List<Group>
    fun findByCreatedBy(username: String): List<Group>
    fun findByNameContainingIgnoreCase(name: String): List<Group>
    fun findByIsActiveTrueAndCreatedBy(username: String): List<Group>
}

@Repository
interface GroupMemberRepository : JpaRepository<GroupMember, Long> {
    fun findByGroupId(groupId: Long): List<GroupMember>
    fun findByUserId(userId: Long): List<GroupMember>
    fun findByGroupIdAndUserId(groupId: Long, userId: Long): GroupMember?
    fun findByGroupIdAndIsActiveTrue(groupId: Long): List<GroupMember>
    fun findByUserIdAndIsActiveTrue(userId: Long): List<GroupMember>
    
    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.groupId = :groupId AND gm.isActive = true")
    fun countActiveMembersByGroupId(@Param("groupId") groupId: Long): Long
}
