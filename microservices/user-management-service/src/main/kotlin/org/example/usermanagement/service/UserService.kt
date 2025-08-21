package org.example.usermanagement.service

import org.example.usermanagement.dto.*
import org.example.usermanagement.model.User
import org.example.usermanagement.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {
    
    fun registerUser(registrationDTO: UserRegistrationDTO): UserResponseDTO {
        // Check if username or email already exists
        if (userRepository.existsByUsername(registrationDTO.username)) {
            throw IllegalArgumentException("Username already exists")
        }
        if (userRepository.existsByEmail(registrationDTO.email)) {
            throw IllegalArgumentException("Email already exists")
        }
        
        // Create new user
        val user = User(
            username = registrationDTO.username,
            email = registrationDTO.email,
            password = passwordEncoder.encode(registrationDTO.password),
            name = registrationDTO.name
        )
        
        val savedUser = userRepository.save(user)
        return mapToResponseDTO(savedUser)
    }
    
    fun authenticateUser(loginDTO: UserLoginDTO): AuthResponseDTO {
        val user = userRepository.findByUsernameAndIsActiveTrue(loginDTO.username)
            .orElseThrow { IllegalArgumentException("Invalid username or password") }
        
        if (!passwordEncoder.matches(loginDTO.password, user.password)) {
            throw IllegalArgumentException("Invalid username or password")
        }
        
        val token = jwtService.generateToken(user.username)
        return AuthResponseDTO(
            token = token,
            user = mapToResponseDTO(user),
            message = "Login successful"
        )
    }
    
    fun getUserById(id: Long): UserResponseDTO {
        val user = userRepository.findById(id)
            .orElseThrow { IllegalArgumentException("User not found") }
        return mapToResponseDTO(user)
    }
    
    fun updateUser(id: Long, updateDTO: UserUpdateDTO): UserResponseDTO {
        val user = userRepository.findById(id)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        val updatedUser = user.copy(
            name = updateDTO.name ?: user.name,
            email = updateDTO.email ?: user.email,
            isActive = updateDTO.isActive ?: user.isActive,
            lastModified = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        return mapToResponseDTO(savedUser)
    }
    
    fun changePassword(id: Long, passwordChangeDTO: PasswordChangeDTO): UserResponseDTO {
        val user = userRepository.findById(id)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        if (!passwordEncoder.matches(passwordChangeDTO.currentPassword, user.password)) {
            throw IllegalArgumentException("Current password is incorrect")
        }
        
        val updatedUser = user.copy(
            password = passwordEncoder.encode(passwordChangeDTO.newPassword),
            lastModified = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        return mapToResponseDTO(savedUser)
    }
    
    fun deactivateUser(id: Long): UserResponseDTO {
        val user = userRepository.findById(id)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        val updatedUser = user.copy(
            isActive = false,
            lastModified = LocalDateTime.now()
        )
        
        val savedUser = userRepository.save(updatedUser)
        return mapToResponseDTO(savedUser)
    }
    
    private fun mapToResponseDTO(user: User): UserResponseDTO {
        return UserResponseDTO(
            id = user.id!!,
            username = user.username,
            email = user.email,
            name = user.name,
            createdAt = user.createdAt,
            lastModified = user.lastModified,
            isActive = user.isActive,
            role = user.role.name
        )
    }
}
