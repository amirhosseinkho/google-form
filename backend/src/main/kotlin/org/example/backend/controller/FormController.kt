package org.example.backend.controller

import org.example.backend.model.dto.api.FormRequestDTO
import org.example.backend.model.dto.api.FormResponseDTO
import org.example.backend.service.FormService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/forms")
class FormController(
    private val formService: FormService
) {

    @GetMapping("/test")
    fun testEndpoint(): ResponseEntity<String> {
        return ResponseEntity.ok("Forms API is working!")
    }

    @GetMapping
    fun getAllForms(@RequestParam(required = false) userId: Long?, @RequestParam(required = false) userEmail: String?): ResponseEntity<List<FormResponseDTO>> {
        try {
            val forms = if (userEmail != null) {
                formService.getFormsByUserEmail(userEmail)
            } else if (userId != null) {
                formService.getFormsByUserId(userId)
            } else {
                formService.getAllForms()
            }
            return ResponseEntity.ok(forms)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }

    @GetMapping("/user/{userId}")
    fun getFormsByUserId(@PathVariable userId: Long): ResponseEntity<List<FormResponseDTO>> {
        try {
            val forms = formService.getFormsByUserId(userId)
            return ResponseEntity.ok(forms)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }

    @GetMapping("/{id}")
    fun getFormById(@PathVariable id: Long): ResponseEntity<FormResponseDTO> {
        try {
            val form = formService.getFormById(id)
            return if (form != null) {
                ResponseEntity.ok(form)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @PostMapping
    fun createForm(@RequestBody request: FormRequestDTO): ResponseEntity<FormResponseDTO> {
        try {
            val form = formService.createForm(request)
            return ResponseEntity.ok(form)
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @PutMapping("/{id}")
    fun updateForm(@PathVariable id: Long, @RequestBody request: FormRequestDTO): ResponseEntity<FormResponseDTO> {
        try {
            val form = formService.updateForm(id, request)
            return if (form != null) {
                ResponseEntity.ok(form)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @DeleteMapping("/{id}")
    fun deleteForm(@PathVariable id: Long): ResponseEntity<Void> {
        val deleted = formService.deleteForm(id)
        return if (deleted) {
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
} 
