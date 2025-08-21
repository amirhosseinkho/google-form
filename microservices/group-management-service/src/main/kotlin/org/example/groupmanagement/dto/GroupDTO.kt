package org.example.groupmanagement.dto

import java.time.LocalDateTime

data class GroupCreateDTO(
    val name: String,
    val description: String?,
    val createdBy: String,
    val maxMembers: Int? = null
)

data class GroupUpdateDTO(
    val name: String?,
    val description: String?,
    val isActive: Boolean?,
    val maxMembers: Int?
)

data class GroupResponseDTO(
    val id: Long,
    val name: String,
    val description: String?,
    val createdBy: String,
    val createdAt: LocalDateTime,
    val lastModified: LocalDateTime,
    val isActive: Boolean,
    val maxMembers: Int?,
    val memberCount: Int
)

data class GroupListDTO(
    val id: Long,
    val name: String,
    val description: String?,
    val createdBy: String,
    val createdAt: LocalDateTime,
    val isActive: Boolean,
    val memberCount: Int
)

data class GroupMemberDTO(
    val id: Long,
    val groupId: Long,
    val userId: Long,
    val joinedAt: LocalDateTime,
    val isAdmin: Boolean,
    val isActive: Boolean
)

data class AddMemberDTO(
    val groupId: Long,
    val userId: Long,
    val isAdmin: Boolean = false
)

data class RemoveMemberDTO(
    val groupId: Long,
    val userId: Long
)
