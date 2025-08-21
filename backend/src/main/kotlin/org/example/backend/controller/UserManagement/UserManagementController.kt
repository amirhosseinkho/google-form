package org.example.backend.controller.UserManagement

import org.example.backend.Enum.userManagement.AuthStatus
import org.example.backend.api.userManagement.IUserManagement
import org.example.backend.model.dto.api.userManagement.*
import org.example.backend.model.dto.internal.userManagement.UserDTO
import org.example.backend.service.userManagement.UserManagementService
import org.example.backend.service.JwtService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/user-managements")
class UserManagementController(
    private val userManagementService: UserManagementService,
    private val jwtService: JwtService
) : IUserManagement
{

    @PostMapping("/sign-up")
    override fun signUpUser(@RequestBody request: CreateUserRequestDTO): ResponseEntity<CreateUserResponseDTO> {
        val userDto = UserDTO(
            username = request.username,
            password = request.password,
            email = request.email,
            name = request.name
        )

        val (savedUser, status) = userManagementService.createUser(userDto)
        val response = CreateUserResponseDTO(
            id = savedUser?.id,
            username = savedUser?.username,
            status = status,
            message = when (status) {
                AuthStatus.SUCCESS -> "User created successfully!"
                AuthStatus.USERNAME_EXISTS -> "Username already exists!"
                AuthStatus.EMAIL_EXISTS -> "Email already registered!"
                else -> "User creation failed!"
            }
        )
        val responseStatus = when (status) {
            AuthStatus.SUCCESS -> HttpStatus.CREATED
            AuthStatus.USERNAME_EXISTS, AuthStatus.EMAIL_EXISTS -> HttpStatus.BAD_REQUEST
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }
        return ResponseEntity.status(responseStatus).body(response)
    }


    @PostMapping("/login")
    override fun loginUser(@RequestBody request: LoginRequestDTO): ResponseEntity<LoginResponseDTO> {
        val (user, status) = userManagementService.loginUser(request.username, request.password)
        val response = LoginResponseDTO(
            id = user?.id,
            username = user?.username,
            email = user?.email,
            name = user?.name,
            status = status,
            token = if (status == AuthStatus.SUCCESS) jwtService.generateToken(user!!) else null,
            message = when (status) {
                AuthStatus.SUCCESS -> "Login successful!"
                AuthStatus.USER_NOT_FOUND -> "User not found!"
                AuthStatus.INVALID_CREDENTIALS -> "Invalid credentials!"
                else -> "Login failed!"
            }
        )
        val responseStatus = when (status) {
            AuthStatus.SUCCESS -> HttpStatus.OK
            AuthStatus.USER_NOT_FOUND, AuthStatus.INVALID_CREDENTIALS -> HttpStatus.BAD_REQUEST
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }
        return ResponseEntity.status(responseStatus).body(response)
    }

    @DeleteMapping("/{id}")
    override fun deleteUserById(@PathVariable id: Long): ResponseEntity<GetUserResponseDTO> {
        val status = userManagementService.deleteUserById(id)
        val response = GetUserResponseDTO(
            status = status,
            message = if (status == AuthStatus.SUCCESS) "User deleted successfully!" else "User not found!"
        )
        val httpStatus = if (status == AuthStatus.SUCCESS) HttpStatus.OK else HttpStatus.NOT_FOUND
        return ResponseEntity.status(httpStatus).body(response)
    }

    @GetMapping("/{id}")
    override fun getUserById(@PathVariable id: Long): ResponseEntity<GetUserResponseDTO> {
        val (user, status) = userManagementService.getUserById(id)
        val response = GetUserResponseDTO(
            id = user?.id,
            username = user?.username,
            email = user?.email,
            name = user?.name,
            status = status,
            message = if (status == AuthStatus.SUCCESS) "User found." else "User not found."
        )
        val httpStatus = if (status == AuthStatus.SUCCESS) HttpStatus.OK else HttpStatus.NOT_FOUND
        return ResponseEntity.status(httpStatus).body(response)
    }

    @GetMapping("/list")
    override fun getUserList(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<UserListResponseDTO> {
        val users = userManagementService.getUserList(page, size)
        val userResponses = users.map { user ->
            GetUserResponseDTO(
                id = user.id,
                username = user.username,
                email = user.email,
                name = user.name,
                status = AuthStatus.SUCCESS
            )
        }
        val response = UserListResponseDTO(
            users = userResponses,
            status = AuthStatus.SUCCESS,
            message = "Users fetched successfully!"
        )
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{id}")
    override fun updateUserById(
        @PathVariable id: Long,
        @RequestBody updateRequest: UpdateUserRequestDTO
    ): ResponseEntity<GetUserResponseDTO> {
        val (updatedUser, status) = userManagementService.updateUserById(id, updateRequest)
        val response = GetUserResponseDTO(
            id = updatedUser?.id,
            username = updatedUser?.username,
            email = updatedUser?.email,
            name = updatedUser?.name,
            status = status,
            message = when (status) {
                AuthStatus.SUCCESS -> "User updated successfully!"
                AuthStatus.USERNAME_EXISTS -> "Username already exists!"
                AuthStatus.EMAIL_EXISTS -> "Email already registered!"
                AuthStatus.USER_NOT_FOUND -> "User not found!"
                else -> "User update failed!"
            }
        )
        val httpStatus = when (status) {
            AuthStatus.SUCCESS -> HttpStatus.OK
            AuthStatus.USERNAME_EXISTS, AuthStatus.EMAIL_EXISTS -> HttpStatus.BAD_REQUEST
            AuthStatus.USER_NOT_FOUND -> HttpStatus.NOT_FOUND
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }
        return ResponseEntity.status(httpStatus).body(response)
    }

    @PostMapping("/forgot-password")
    fun forgotPassword(@RequestBody request: Map<String, String>): ResponseEntity<Map<String, String>> {
        val email = request["email"]
        if (email.isNullOrBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("message" to "Email is required"))
        }
        val (token, status) = userManagementService.createPasswordResetToken(email)
        return if (status == AuthStatus.SUCCESS) {
            ResponseEntity.ok(mapOf("message" to "Use this token to reset your password.", "token" to token!!))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("message" to "User not found!"))
        }
    }

    @PostMapping("/reset-password")
    fun resetPassword(@RequestBody request: Map<String, String>): ResponseEntity<Map<String, String>> {
        val token = request["token"]
        val newPassword = request["newPassword"]
        if (token.isNullOrBlank() || newPassword.isNullOrBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("message" to "Token and new password are required"))
        }
        val status = userManagementService.resetPassword(token, newPassword)
        return if (status == AuthStatus.SUCCESS) {
            ResponseEntity.ok(mapOf("message" to "Password reset successful!"))
        } else {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("message" to "Invalid or expired token."))
        }
    }


}
