package org.example.usermanagement.dto

import java.time.LocalDateTime

data class UserRegistrationDTO(
    val username: String,
    val email: String,
    val password: String,
    val name: String
)

data class UserLoginDTO(
    val username: String,
    val password: String
)

data class UserResponseDTO(
    val id: Long,
    val username: String,
    val email: String,
    val name: String,
    val createdAt: LocalDateTime,
    val lastModified: LocalDateTime,
    val isActive: Boolean,
    val role: String
)

data class UserUpdateDTO(
    val name: String?,
    val email: String?,
    val isActive: Boolean?
)

data class AuthResponseDTO(
    val token: String,
    val user: UserResponseDTO,
    val message: String
)

data class PasswordResetDTO(
    val email: String
)

data class PasswordChangeDTO(
    val currentPassword: String,
    val newPassword: String
)
