package org.example.backend.controller

import org.example.backend.model.dto.api.*
import org.example.backend.service.GroupService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/groups")
class GroupController(
    private val groupService: GroupService
) {

    @GetMapping
    fun getAllGroups(@RequestParam(required = false) userEmail: String?): ResponseEntity<List<GroupResponseDTO>> {
        try {
            val groups = if (userEmail != null) {
                groupService.getGroupsByUserEmail(userEmail)
            } else {
                groupService.getAllGroups()
            }
            return ResponseEntity.ok(groups)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }

    @GetMapping("/{id}")
    fun getGroupById(@PathVariable id: Long, @RequestParam(required = false) userEmail: String?): ResponseEntity<GroupResponseDTO> {
        try {
            val group = groupService.getGroupById(id)
            return if (group != null) {
                // Check if user has access to this group
                if (userEmail != null && group.createdBy != userEmail) {
                    ResponseEntity.status(403).build() // Forbidden
                } else {
                    ResponseEntity.ok(group)
                }
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @PostMapping
    fun createGroup(@RequestBody request: GroupRequestDTO): ResponseEntity<GroupResponseDTO> {
        try {
            val group = groupService.createGroup(request)
            return ResponseEntity.ok(group)
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @PutMapping("/{id}")
    fun updateGroup(@PathVariable id: Long, @RequestBody request: GroupRequestDTO, @RequestParam(required = false) userEmail: String?): ResponseEntity<GroupResponseDTO> {
        try {
            // Check if user has access to this group
            if (userEmail != null) {
                val group = groupService.getGroupById(id)
                if (group == null) {
                    return ResponseEntity.notFound().build()
                }
                if (group.createdBy != userEmail) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val group = groupService.updateGroup(id, request)
            return if (group != null) {
                ResponseEntity.ok(group)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @DeleteMapping("/{id}")
    fun deleteGroup(@PathVariable id: Long, @RequestParam(required = false) userEmail: String?): ResponseEntity<Void> {
        try {
            // Check if user has access to this group
            if (userEmail != null) {
                val group = groupService.getGroupById(id)
                if (group == null) {
                    return ResponseEntity.notFound().build()
                }
                if (group.createdBy != userEmail) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val deleted = groupService.deleteGroup(id)
            return if (deleted) {
                ResponseEntity.ok().build()
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @PostMapping("/members")
    fun addMemberToGroup(@RequestBody request: GroupMemberRequestDTO, @RequestParam(required = false) userEmail: String?): ResponseEntity<GroupMemberResponseDTO> {
        try {
            // Check if user has access to this group
            if (userEmail != null) {
                val group = groupService.getGroupById(request.groupId)
                if (group == null) {
                    return ResponseEntity.notFound().build()
                }
                if (group.createdBy != userEmail) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val member = groupService.addMemberToGroup(request)
            return if (member != null) {
                ResponseEntity.ok(member)
            } else {
                ResponseEntity.badRequest().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    fun removeMemberFromGroup(@PathVariable groupId: Long, @PathVariable userId: Long, @RequestParam(required = false) userEmail: String?): ResponseEntity<Void> {
        try {
            // Check if user has access to this group
            if (userEmail != null) {
                val group = groupService.getGroupById(groupId)
                if (group == null) {
                    return ResponseEntity.notFound().build()
                }
                if (group.createdBy != userEmail) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val removed = groupService.removeMemberFromGroup(groupId, userId)
            return if (removed) {
                ResponseEntity.ok().build()
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/{groupId}/members")
    fun getGroupMembers(@PathVariable groupId: Long, @RequestParam(required = false) userEmail: String?): ResponseEntity<List<GroupMemberResponseDTO>> {
        try {
            // Check if user has access to this group
            if (userEmail != null) {
                val group = groupService.getGroupById(groupId)
                if (group == null) {
                    return ResponseEntity.notFound().build()
                }
                if (group.createdBy != userEmail) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val members = groupService.getGroupMembers(groupId)
            return ResponseEntity.ok(members)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }
} 