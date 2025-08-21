package org.example.groupmanagement.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "groups", schema = "group_management")
data class Group(
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(nullable = false)
    val name: String,
    
    @Column(columnDefinition = "TEXT")
    val description: String? = null,
    
    @Column(name = "created_by", nullable = false)
    val createdBy: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "last_modified", nullable = false)
    val lastModified: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true,
    
    @Column(name = "max_members")
    val maxMembers: Int? = null
)

@Entity
@Table(name = "group_members", schema = "group_management")
data class GroupMember(
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(name = "group_id", nullable = false)
    val groupId: Long,
    
    @Column(name = "user_id", nullable = false)
    val userId: Long,
    
    @Column(name = "joined_at", nullable = false)
    val joinedAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_admin", nullable = false)
    val isAdmin: Boolean = false,
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true
)
