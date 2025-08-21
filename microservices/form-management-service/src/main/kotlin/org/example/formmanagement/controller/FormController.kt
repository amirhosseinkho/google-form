package org.example.formmanagement.controller

import org.example.formmanagement.dto.*
import org.example.formmanagement.service.FormService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = ["*"])
class FormController(
    private val formService: FormService
) {
    
    @PostMapping
    fun createForm(@RequestBody createDTO: FormCreateDTO): ResponseEntity<FormResponseDTO> {
        val form = formService.createForm(createDTO)
        return ResponseEntity.ok(form)
    }
    
    @GetMapping("/{id}")
    fun getFormById(@PathVariable id: Long): ResponseEntity<FormResponseDTO> {
        val form = formService.getFormById(id)
        return ResponseEntity.ok(form)
    }
    
    @GetMapping
    fun getAllForms(): ResponseEntity<List<FormListDTO>> {
        val forms = formService.getAllActiveForms()
        return ResponseEntity.ok(forms)
    }
    
    @GetMapping("/creator/{username}")
    fun getFormsByCreator(@PathVariable username: String): ResponseEntity<List<FormListDTO>> {
        val forms = formService.getFormsByCreator(username)
        return ResponseEntity.ok(forms)
    }
    
    @GetMapping("/templates")
    fun getFormTemplates(): ResponseEntity<List<FormListDTO>> {
        val templates = formService.getFormTemplates()
        return ResponseEntity.ok(templates)
    }
    
    @GetMapping("/search")
    fun searchForms(@RequestParam query: String): ResponseEntity<List<FormListDTO>> {
        val forms = formService.searchForms(query)
        return ResponseEntity.ok(forms)
    }
    
    @PutMapping("/{id}")
    fun updateForm(
        @PathVariable id: Long,
        @RequestBody updateDTO: FormUpdateDTO
    ): ResponseEntity<FormResponseDTO> {
        val form = formService.updateForm(id, updateDTO)
        return ResponseEntity.ok(form)
    }
    
    @DeleteMapping("/{id}")
    fun deleteForm(@PathVariable id: Long): ResponseEntity<String> {
        formService.deleteForm(id)
        return ResponseEntity.ok("Form deleted successfully")
    }
    
    @PostMapping("/{id}/deactivate")
    fun deactivateForm(@PathVariable id: Long): ResponseEntity<FormResponseDTO> {
        val form = formService.deactivateForm(id)
        return ResponseEntity.ok(form)
    }
    
    @GetMapping("/health")
    fun health(): ResponseEntity<String> {
        return ResponseEntity.ok("Form Management Service is running")
    }
}
