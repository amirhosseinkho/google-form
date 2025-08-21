package org.example.groupmanagement.controller

import org.example.groupmanagement.dto.*
import org.example.groupmanagement.service.GroupService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = ["*"])
class GroupController(
    private val groupService: GroupService
) {
    
    @PostMapping
    fun createGroup(@RequestBody createDTO: GroupCreateDTO): ResponseEntity<GroupResponseDTO> {
        val group = groupService.createGroup(createDTO)
        return ResponseEntity.ok(group)
    }
    
    @GetMapping("/{id}")
    fun getGroupById(@PathVariable id: Long): ResponseEntity<GroupResponseDTO> {
        val group = groupService.getGroupById(id)
        return ResponseEntity.ok(group)
    }
    
    @GetMapping
    fun getAllGroups(): ResponseEntity<List<GroupListDTO>> {
        val groups = groupService.getAllActiveGroups()
        return ResponseEntity.ok(groups)
    }
    
    @GetMapping("/creator/{username}")
    fun getGroupsByCreator(@PathVariable username: String): ResponseEntity<List<GroupListDTO>> {
        val groups = groupService.getGroupsByCreator(username)
        return ResponseEntity.ok(groups)
    }
    
    @GetMapping("/search")
    fun searchGroups(@RequestParam query: String): ResponseEntity<List<GroupListDTO>> {
        val groups = groupService.searchGroups(query)
        return ResponseEntity.ok(groups)
    }
    
    @PutMapping("/{id}")
    fun updateGroup(
        @PathVariable id: Long,
        @RequestBody updateDTO: GroupUpdateDTO
    ): ResponseEntity<GroupResponseDTO> {
        val group = groupService.updateGroup(id, updateDTO)
        return ResponseEntity.ok(group)
    }
    
    @PostMapping("/{id}/deactivate")
    fun deactivateGroup(@PathVariable id: Long): ResponseEntity<GroupResponseDTO> {
        val group = groupService.deactivateGroup(id)
        return ResponseEntity.ok(group)
    }
    
    @PostMapping("/members")
    fun addMember(@RequestBody addMemberDTO: AddMemberDTO): ResponseEntity<GroupMemberDTO> {
        val member = groupService.addMember(addMemberDTO)
        return ResponseEntity.ok(member)
    }
    
    @DeleteMapping("/members")
    fun removeMember(@RequestBody removeMemberDTO: RemoveMemberDTO): ResponseEntity<String> {
        val result = groupService.removeMember(removeMemberDTO)
        return ResponseEntity.ok(result)
    }
    
    @GetMapping("/{id}/members")
    fun getGroupMembers(@PathVariable id: Long): ResponseEntity<List<GroupMemberDTO>> {
        val members = groupService.getGroupMembers(id)
        return ResponseEntity.ok(members)
    }
    
    @GetMapping("/user/{userId}")
    fun getUserGroups(@PathVariable userId: Long): ResponseEntity<List<GroupListDTO>> {
        val groups = groupService.getUserGroups(userId)
        return ResponseEntity.ok(groups)
    }
    
    @GetMapping("/health")
    fun health(): ResponseEntity<String> {
        return ResponseEntity.ok("Group Management Service is running")
    }
}
