package org.example.usermanagement.controller

import org.example.usermanagement.dto.*
import org.example.usermanagement.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = ["*"])
class UserController(
    private val userService: UserService
) {
    
    @PostMapping("/register")
    fun registerUser(@RequestBody registrationDTO: UserRegistrationDTO): ResponseEntity<UserResponseDTO> {
        val user = userService.registerUser(registrationDTO)
        return ResponseEntity.ok(user)
    }
    
    @PostMapping("/login")
    fun loginUser(@RequestBody loginDTO: UserLoginDTO): ResponseEntity<AuthResponseDTO> {
        val authResponse = userService.authenticateUser(loginDTO)
        return ResponseEntity.ok(authResponse)
    }
    
    @GetMapping("/{id}")
    fun getUserById(@PathVariable id: Long): ResponseEntity<UserResponseDTO> {
        val user = userService.getUserById(id)
        return ResponseEntity.ok(user)
    }
    
    @PutMapping("/{id}")
    fun updateUser(
        @PathVariable id: Long,
        @RequestBody updateDTO: UserUpdateDTO
    ): ResponseEntity<UserResponseDTO> {
        val user = userService.updateUser(id, updateDTO)
        return ResponseEntity.ok(user)
    }
    
    @PostMapping("/{id}/change-password")
    fun changePassword(
        @PathVariable id: Long,
        @RequestBody passwordChangeDTO: PasswordChangeDTO
    ): ResponseEntity<UserResponseDTO> {
        val user = userService.changePassword(id, passwordChangeDTO)
        return ResponseEntity.ok(user)
    }
    
    @DeleteMapping("/{id}")
    fun deactivateUser(@PathVariable id: Long): ResponseEntity<UserResponseDTO> {
        val user = userService.deactivateUser(id)
        return ResponseEntity.ok(user)
    }
    
    @GetMapping("/health")
    fun health(): ResponseEntity<String> {
        return ResponseEntity.ok("User Management Service is running")
    }
}
