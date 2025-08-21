package org.example.backend.service

import org.example.backend.model.database.Group
import org.example.backend.model.database.GroupMember
import org.example.backend.model.database.UserModel
import org.example.backend.model.dto.api.GroupRequestDTO
import org.example.backend.model.dto.api.GroupResponseDTO
import org.example.backend.model.dto.api.GroupMemberRequestDTO
import org.example.backend.model.dto.api.GroupMemberResponseDTO
import org.example.backend.repository.GroupRepository
import org.example.backend.repository.GroupMemberRepository
import org.example.backend.repository.userManagement.UserRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class GroupService(
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
    private val userRepository: UserRepository
) {
    
    fun getAllGroups(): List<GroupResponseDTO> {
        val groups = groupRepository.findAll()
        return groups.map { group ->
            val memberCount = groupMemberRepository.countMembersByGroupId(group.id).toInt()
            GroupResponseDTO(
                id = group.id,
                name = group.name,
                description = group.description,
                memberCount = memberCount,
                createdBy = group.createdBy,
                createdAt = group.createdAt,
                lastModified = group.lastModified
            )
        }
    }

    fun getGroupsByUserEmail(userEmail: String): List<GroupResponseDTO> {
        val groups = groupRepository.findByCreatedBy(userEmail)
        return groups.map { group ->
            val memberCount = groupMemberRepository.countMembersByGroupId(group.id).toInt()
            GroupResponseDTO(
                id = group.id,
                name = group.name,
                description = group.description,
                memberCount = memberCount,
                createdBy = group.createdBy,
                createdAt = group.createdAt,
                lastModified = group.lastModified
            )
        }
    }
    
    fun getGroupById(id: Long): GroupResponseDTO? {
        val group = groupRepository.findById(id).orElse(null) ?: return null
        val memberCount = groupMemberRepository.countMembersByGroupId(group.id).toInt()
        return GroupResponseDTO(
            id = group.id,
            name = group.name,
            description = group.description,
            memberCount = memberCount,
            createdBy = group.createdBy,
            createdAt = group.createdAt,
            lastModified = group.lastModified
        )
    }
    
    fun createGroup(request: GroupRequestDTO): GroupResponseDTO {
        val group = Group(
            name = request.name,
            description = request.description,
            createdBy = if (request.createdBy.isNullOrEmpty() || request.createdBy == "unknown") "Unknown Creator" else request.createdBy,
            createdAt = LocalDateTime.now().toString(),
            lastModified = LocalDateTime.now().toString()
        )
        val savedGroup = groupRepository.save(group)
        return GroupResponseDTO(
            id = savedGroup.id,
            name = savedGroup.name,
            description = savedGroup.description,
            memberCount = 0,
            createdBy = savedGroup.createdBy,
            createdAt = savedGroup.createdAt,
            lastModified = savedGroup.lastModified
        )
    }
    
    fun updateGroup(id: Long, request: GroupRequestDTO): GroupResponseDTO? {
        val existingGroup = groupRepository.findById(id).orElse(null) ?: return null
        val updatedGroup = existingGroup.copy(
            name = request.name,
            description = request.description,
            lastModified = LocalDateTime.now().toString()
        )
        val savedGroup = groupRepository.save(updatedGroup)
        val memberCount = groupMemberRepository.countMembersByGroupId(savedGroup.id).toInt()
        return GroupResponseDTO(
            id = savedGroup.id,
            name = savedGroup.name,
            description = savedGroup.description,
            memberCount = memberCount,
            createdBy = savedGroup.createdBy,
            createdAt = savedGroup.createdAt,
            lastModified = savedGroup.lastModified
        )
    }
    
    fun deleteGroup(id: Long): Boolean {
        if (!groupRepository.existsById(id)) {
            return false
        }
        // Delete all group members first
        groupMemberRepository.findByGroupId(id).forEach { member ->
            groupMemberRepository.delete(member)
        }
        groupRepository.deleteById(id)
        return true
    }
    
    fun addMemberToGroup(request: GroupMemberRequestDTO): GroupMemberResponseDTO? {
        // Check if group exists
        if (!groupRepository.existsById(request.groupId)) {
            return null
        }
        
        // Check if user exists
        val user = userRepository.findById(request.userId).orElse(null) ?: return null
        
        // Check if user is already a member
        if (groupMemberRepository.existsByGroupIdAndUserId(request.groupId, request.userId)) {
            return null
        }
        
        val groupMember = GroupMember(
            groupId = request.groupId,
            userId = request.userId,
            joinedAt = LocalDateTime.now().toString()
        )
        val savedMember = groupMemberRepository.save(groupMember)
        
        return GroupMemberResponseDTO(
            id = savedMember.id,
            groupId = savedMember.groupId,
            userId = savedMember.userId,
            userName = user.name,
            joinedAt = savedMember.joinedAt
        )
    }
    
    fun removeMemberFromGroup(groupId: Long, userId: Long): Boolean {
        val member = groupMemberRepository.findByGroupId(groupId)
            .find { it.userId == userId } ?: return false
        
        groupMemberRepository.delete(member)
        return true
    }
    
    fun getGroupMembers(groupId: Long): List<GroupMemberResponseDTO> {
        val members = groupMemberRepository.findByGroupId(groupId)
        return members.mapNotNull { member ->
            val user = userRepository.findById(member.userId).orElse(null) ?: return@mapNotNull null
            GroupMemberResponseDTO(
                id = member.id,
                groupId = member.groupId,
                userId = member.userId,
                userName = user.name,
                joinedAt = member.joinedAt
            )
        }
    }
} 