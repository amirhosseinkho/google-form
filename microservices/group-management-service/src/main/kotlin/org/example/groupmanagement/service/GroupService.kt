package org.example.groupmanagement.service

import org.example.groupmanagement.dto.*
import org.example.groupmanagement.model.Group
import org.example.groupmanagement.model.GroupMember
import org.example.groupmanagement.repository.GroupMemberRepository
import org.example.groupmanagement.repository.GroupRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class GroupService(
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository
) {
    
    fun createGroup(createDTO: GroupCreateDTO): GroupResponseDTO {
        val group = Group(
            name = createDTO.name,
            description = createDTO.description,
            createdBy = createDTO.createdBy,
            maxMembers = createDTO.maxMembers
        )
        
        val savedGroup = groupRepository.save(group)
        
        // Add creator as admin member
        val creatorMember = GroupMember(
            groupId = savedGroup.id!!,
            userId = 0L, // This should be the actual user ID from user service
            isAdmin = true
        )
        groupMemberRepository.save(creatorMember)
        
        return mapToResponseDTO(savedGroup, 1)
    }
    
    fun getGroupById(id: Long): GroupResponseDTO {
        val group = groupRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Group not found") }
        
        val memberCount = groupMemberRepository.countActiveMembersByGroupId(id)
        return mapToResponseDTO(group, memberCount.toInt())
    }
    
    fun getAllActiveGroups(): List<GroupListDTO> {
        return groupRepository.findByIsActiveTrue().map { group ->
            val memberCount = groupMemberRepository.countActiveMembersByGroupId(group.id!!)
            mapToListDTO(group, memberCount.toInt())
        }
    }
    
    fun getGroupsByCreator(username: String): List<GroupListDTO> {
        return groupRepository.findByIsActiveTrueAndCreatedBy(username).map { group ->
            val memberCount = groupMemberRepository.countActiveMembersByGroupId(group.id!!)
            mapToListDTO(group, memberCount.toInt())
        }
    }
    
    fun searchGroups(query: String): List<GroupListDTO> {
        return groupRepository.findByNameContainingIgnoreCase(query).map { group ->
            val memberCount = groupMemberRepository.countActiveMembersByGroupId(group.id!!)
            mapToListDTO(group, memberCount.toInt())
        }
    }
    
    fun updateGroup(id: Long, updateDTO: GroupUpdateDTO): GroupResponseDTO {
        val group = groupRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Group not found") }
        
        val updatedGroup = group.copy(
            name = updateDTO.name ?: group.name,
            description = updateDTO.description ?: group.description,
            isActive = updateDTO.isActive ?: group.isActive,
            maxMembers = updateDTO.maxMembers ?: group.maxMembers,
            lastModified = LocalDateTime.now()
        )
        
        val savedGroup = groupRepository.save(updatedGroup)
        val memberCount = groupMemberRepository.countActiveMembersByGroupId(id)
        return mapToResponseDTO(savedGroup, memberCount.toInt())
    }
    
    fun deactivateGroup(id: Long): GroupResponseDTO {
        val group = groupRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Group not found") }
        
        val updatedGroup = group.copy(
            isActive = false,
            lastModified = LocalDateTime.now()
        )
        
        val savedGroup = groupRepository.save(updatedGroup)
        val memberCount = groupMemberRepository.countActiveMembersByGroupId(id)
        return mapToResponseDTO(savedGroup, memberCount.toInt())
    }
    
    fun addMember(addMemberDTO: AddMemberDTO): GroupMemberDTO {
        val group = groupRepository.findById(addMemberDTO.groupId)
            .orElseThrow { IllegalArgumentException("Group not found") }
        
        if (!group.isActive) {
            throw IllegalArgumentException("Cannot add member to inactive group")
        }
        
        // Check if member already exists
        val existingMember = groupMemberRepository.findByGroupIdAndUserId(
            addMemberDTO.groupId, addMemberDTO.userId
        )
        
        if (existingMember != null) {
            if (existingMember.isActive) {
                throw IllegalArgumentException("User is already a member of this group")
            } else {
                // Reactivate existing member
                val reactivatedMember = existingMember.copy(
                    isActive = true,
                    isAdmin = addMemberDTO.isAdmin
                )
                val savedMember = groupMemberRepository.save(reactivatedMember)
                return mapToMemberDTO(savedMember)
            }
        }
        
        // Check max members limit
        val currentMemberCount = groupMemberRepository.countActiveMembersByGroupId(addMemberDTO.groupId)
        if (group.maxMembers != null && currentMemberCount >= group.maxMembers) {
            throw IllegalArgumentException("Group has reached maximum member limit")
        }
        
        val newMember = GroupMember(
            groupId = addMemberDTO.groupId,
            userId = addMemberDTO.userId,
            isAdmin = addMemberDTO.isAdmin
        )
        
        val savedMember = groupMemberRepository.save(newMember)
        return mapToMemberDTO(savedMember)
    }
    
    fun removeMember(removeMemberDTO: RemoveMemberDTO): String {
        val member = groupMemberRepository.findByGroupIdAndUserId(
            removeMemberDTO.groupId, removeMemberDTO.userId
        ) ?: throw IllegalArgumentException("Member not found in group")
        
        val updatedMember = member.copy(isActive = false)
        groupMemberRepository.save(updatedMember)
        
        return "Member removed successfully"
    }
    
    fun getGroupMembers(groupId: Long): List<GroupMemberDTO> {
        return groupMemberRepository.findByGroupIdAndIsActiveTrue(groupId)
            .map { mapToMemberDTO(it) }
    }
    
    fun getUserGroups(userId: Long): List<GroupListDTO> {
        val memberGroups = groupMemberRepository.findByUserIdAndIsActiveTrue(userId)
        return memberGroups.map { member ->
            val group = groupRepository.findById(member.groupId)
                .orElseThrow { IllegalArgumentException("Group not found") }
            val memberCount = groupMemberRepository.countActiveMembersByGroupId(group.id!!)
            mapToListDTO(group, memberCount.toInt())
        }
    }
    
    private fun mapToResponseDTO(group: Group, memberCount: Int): GroupResponseDTO {
        return GroupResponseDTO(
            id = group.id!!,
            name = group.name,
            description = group.description,
            createdBy = group.createdBy,
            createdAt = group.createdAt,
            lastModified = group.lastModified,
            isActive = group.isActive,
            maxMembers = group.maxMembers,
            memberCount = memberCount
        )
    }
    
    private fun mapToListDTO(group: Group, memberCount: Int): GroupListDTO {
        return GroupListDTO(
            id = group.id!!,
            name = group.name,
            description = group.description,
            createdBy = group.createdBy,
            createdAt = group.createdAt,
            isActive = group.isActive,
            memberCount = memberCount
        )
    }
    
    private fun mapToMemberDTO(member: GroupMember): GroupMemberDTO {
        return GroupMemberDTO(
            id = member.id!!,
            groupId = member.groupId,
            userId = member.userId,
            joinedAt = member.joinedAt,
            isAdmin = member.isAdmin,
            isActive = member.isActive
        )
    }
}
