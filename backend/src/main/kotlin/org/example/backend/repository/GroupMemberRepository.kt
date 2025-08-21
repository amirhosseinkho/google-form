package org.example.backend.repository

import org.example.backend.model.database.GroupMember
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface GroupMemberRepository : JpaRepository<GroupMember, Long> {
    
    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.groupId = :groupId")
    fun countMembersByGroupId(@Param("groupId") groupId: Long): Long
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.groupId = :groupId")
    fun findByGroupId(@Param("groupId") groupId: Long): List<GroupMember>
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.userId = :userId")
    fun findByUserId(@Param("userId") userId: Long): List<GroupMember>
    
    fun existsByGroupIdAndUserId(groupId: Long, userId: Long): Boolean
} 