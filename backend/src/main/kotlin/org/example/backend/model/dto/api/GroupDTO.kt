package org.example.backend.model.dto.api

data class GroupRequestDTO(
    val name: String,
    val description: String,
    val createdBy: String? = null
)

data class GroupResponseDTO(
    val id: Long,
    val name: String,
    val description: String,
    val memberCount: Int,
    val createdBy: String? = null,
    val createdAt: String? = null,
    val lastModified: String? = null
)

data class GroupMemberRequestDTO(
    val groupId: Long,
    val userId: Long
)

data class GroupMemberResponseDTO(
    val id: Long,
    val groupId: Long,
    val userId: Long,
    val userName: String? = null,
    val joinedAt: String? = null
) 