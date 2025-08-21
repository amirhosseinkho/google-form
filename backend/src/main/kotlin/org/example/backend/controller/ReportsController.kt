package org.example.backend.controller

import org.example.backend.model.dto.api.*
import org.example.backend.service.ReportsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/reports")
class ReportsController(
    private val reportsService: ReportsService
) {

    @GetMapping("/system-stats")
    fun getSystemStats(@RequestParam(required = false) userEmail: String?): ResponseEntity<SystemStatsDTO> {
        try {
            val stats = if (userEmail != null) {
                reportsService.getUserStats(userEmail)
            } else {
                reportsService.getSystemStats()
            }
            return ResponseEntity.ok(stats)
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/forms-with-stats")
    fun getFormsWithStats(@RequestParam(required = false) userEmail: String?): ResponseEntity<List<FormWithStatsDTO>> {
        try {
            val forms = if (userEmail != null) {
                reportsService.getFormsWithStatsByUser(userEmail)
            } else {
                reportsService.getFormsWithStats()
            }
            return ResponseEntity.ok(forms)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }

    @GetMapping("/form/{formId}/analytics")
    fun getFormAnalytics(@PathVariable formId: Long, @RequestParam(required = false) userEmail: String?): ResponseEntity<FormAnalyticsDTO> {
        try {
            // Check if user has access to this form
            if (userEmail != null) {
                if (!reportsService.hasUserAccessToForm(userEmail, formId)) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val analytics = reportsService.getFormAnalytics(formId)
            return if (analytics != null) {
                ResponseEntity.ok(analytics)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/recent-activity")
    fun getRecentActivity(@RequestParam(required = false) userEmail: String?): ResponseEntity<List<RecentActivityDTO>> {
        try {
            val activities = if (userEmail != null) {
                reportsService.getUserRecentActivity(userEmail)
            } else {
                reportsService.getRecentActivity()
            }
            return ResponseEntity.ok(activities)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(emptyList())
        }
    }

    @GetMapping("/submissions-count")
    fun getSubmissionsCount(): ResponseEntity<Long> {
        try {
            val count = reportsService.getTotalSubmissionsCount()
            return ResponseEntity.ok(count)
        } catch (e: Exception) {
            return ResponseEntity.status(500).body(0L)
        }
    }

    @GetMapping("/form/{formId}/csv")
    fun getFormDataAsCSV(@PathVariable formId: Long, @RequestParam(required = false) userEmail: String?): ResponseEntity<String> {
        try {
            // Check if user has access to this form
            if (userEmail != null) {
                if (!reportsService.hasUserAccessToForm(userEmail, formId)) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val csvData = reportsService.getFormDataAsCSV(formId)
            return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=\"form_${formId}_data.csv\"")
                .body(csvData)
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }

    @GetMapping("/form/{formId}/field-stats")
    fun getFormFieldStats(@PathVariable formId: Long, @RequestParam(required = false) userEmail: String?): ResponseEntity<Map<String, Any>> {
        try {
            // Check if user has access to this form
            if (userEmail != null) {
                if (!reportsService.hasUserAccessToForm(userEmail, formId)) {
                    return ResponseEntity.status(403).build() // Forbidden
                }
            }
            
            val fieldStats = reportsService.getFormFieldStats(formId)
            return ResponseEntity.ok(fieldStats)
        } catch (e: Exception) {
            return ResponseEntity.status(500).build()
        }
    }
} 