package org.example.backend.service.userManagement

import org.example.backend.Enum.userManagement.AuthStatus
import org.example.backend.model.database.UserModel
import org.example.backend.model.dto.api.userManagement.UpdateUserRequestDTO
import org.example.backend.model.dto.internal.userManagement.UserDTO
import org.example.backend.repository.userManagement.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.example.backend.model.database.PasswordResetToken
import org.example.backend.repository.userManagement.PasswordResetTokenRepository
import java.time.LocalDateTime
import java.util.UUID
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.SimpleMailMessage
import org.springframework.transaction.annotation.Transactional

@Service
class UserManagementService(
    val userRepository: UserRepository,
    val passwordEncoder: PasswordEncoder,
    val passwordResetTokenRepository: PasswordResetTokenRepository,
    val mailSender: JavaMailSender // for real email, can be mocked/logged for demo
)
{
    fun createUser(user: UserDTO): Pair<UserModel?, AuthStatus> {
        if (userRepository.existsByUsername(user.username!!)) {
            return Pair(null, AuthStatus.USERNAME_EXISTS)
        }

        if (userRepository.existsByEmail(user.email!!)) {
            return Pair(null, AuthStatus.EMAIL_EXISTS)
        }

        val hashedPassword = passwordEncoder.encode(user.password!!)
        val newUser = UserModel(
            username = user.username!!,
            password = hashedPassword,
            email = user.email!!,
            name = user.name!!
        )
        val savedUser = userRepository.save(newUser)
        return Pair(savedUser, AuthStatus.SUCCESS)
    }

    fun loginUser(username: String, password: String): Pair<UserModel?, AuthStatus> {
        val user = userRepository.findByUsername(username)
            ?: return Pair(null, AuthStatus.USER_NOT_FOUND)

        if (!passwordEncoder.matches(password, user.password)) {
            return Pair(null, AuthStatus.INVALID_CREDENTIALS)
        }

        return Pair(user, AuthStatus.SUCCESS)
    }

    fun deleteUserById(id: Long): AuthStatus {
        if (!userRepository.existsById(id)) {
            return AuthStatus.USER_NOT_FOUND
        }
        userRepository.deleteById(id)
        return AuthStatus.SUCCESS
    }

    fun getUserById(id: Long): Pair<UserModel?, AuthStatus> {
        val user = userRepository.findById(id).orElse(null)
        return if (user != null) {
            Pair(user, AuthStatus.SUCCESS)
        } else {
            Pair(null, AuthStatus.USER_NOT_FOUND)
        }
    }

    fun getUserList(page: Int, size: Int): List<UserModel> {
        val pageable = PageRequest.of(page, size, Sort.by("id").ascending())
        val pageResult = userRepository.findAll(pageable)
        return pageResult.content
    }

    fun updateUserById(id: Long, updateRequest: UpdateUserRequestDTO): Pair<UserModel?, AuthStatus> {
        val user = userRepository.findById(id).orElse(null)
            ?: return Pair(null, AuthStatus.USER_NOT_FOUND)

        // Check for potential updates
        updateRequest.username?.let {
            // Optional: check if new username already exists
            if (it != user.username && userRepository.existsByUsername(it)) {
                return Pair(null, AuthStatus.USERNAME_EXISTS)
            }
            user.username = it
        }

        updateRequest.email?.let {
            if (it != user.email && userRepository.existsByEmail(it)) {
                return Pair(null, AuthStatus.EMAIL_EXISTS)
            }
            user.email = it
        }

        updateRequest.password?.let {
            user.password = passwordEncoder.encode(it)
        }

        updateRequest.name?.let {
            user.name = it
        }

        val updatedUser = userRepository.save(user)
        return Pair(updatedUser, AuthStatus.SUCCESS)
    }

    fun forgotPassword(email: String): Pair<String?, AuthStatus> {
        val user = userRepository.findByEmail(email)
            ?: return Pair(null, AuthStatus.USER_NOT_FOUND)
        // Generate a simple random password (for demo only)
        val newPassword = (1..8)
            .map { ('a'..'z') + ('A'..'Z') + ('0'..'9') }
            .flatten()
            .shuffled()
            .take(8)
            .joinToString("")
        user.password = passwordEncoder.encode(newPassword)
        userRepository.save(user)
        return Pair(newPassword, AuthStatus.SUCCESS)
    }

    fun createPasswordResetToken(email: String): Pair<String?, AuthStatus> {
        val user = userRepository.findByEmail(email) ?: return Pair(null, AuthStatus.USER_NOT_FOUND)
        // Delete any existing token for this user
        passwordResetTokenRepository.findAll().filter { it.user.id == user.id }.forEach { passwordResetTokenRepository.delete(it) }
        val token = UUID.randomUUID().toString()
        val expiry = LocalDateTime.now().plusMinutes(5)
        val resetToken = PasswordResetToken(token = token, user = user, expiryDate = expiry)
        passwordResetTokenRepository.save(resetToken)
        return Pair(token, AuthStatus.SUCCESS)
    }

    @Transactional
    fun resetPassword(token: String, newPassword: String): AuthStatus {
        val resetToken = passwordResetTokenRepository.findByToken(token)
            ?: return AuthStatus.INVALID_CREDENTIALS
        if (resetToken.expiryDate.isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.deleteByToken(token)
            return AuthStatus.INVALID_CREDENTIALS
        }
        val user = resetToken.user
        user.password = passwordEncoder.encode(newPassword)
        userRepository.save(user)
        passwordResetTokenRepository.deleteByToken(token)
        return AuthStatus.SUCCESS
    }
}
