package org.example.backend.service

import org.example.backend.model.dto.api.*
import org.example.backend.repository.*
import org.example.backend.repository.userManagement.UserRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import java.time.format.DateTimeFormatter
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.fasterxml.jackson.core.type.TypeReference

@Service
class ReportsService(
    private val formRepository: FormRepository,
    private val userRepository: UserRepository,
    private val groupRepository: GroupRepository,
    private val formSubmissionRepository: FormSubmissionRepository,
    private val groupMemberRepository: GroupMemberRepository,
    private val formAssignmentRepository: FormAssignmentRepository
) {
    private val objectMapper = ObjectMapper().apply {
        registerKotlinModule()
    }

    fun getSystemStats(): SystemStatsDTO {
        val totalForms = formRepository.count()
        val totalUsers = userRepository.count()
        val totalGroups = groupRepository.count()
        val totalSubmissions = formSubmissionRepository.count()
        
        // Recent submissions (last 7 days) - simplified approach
        val recentSubmissions = formSubmissionRepository.count() // For now, just return total count
        
        // Completed forms (forms with at least one submission)
        val completedForms = formRepository.countBySubmissionsIsNotEmpty()
        
        return SystemStatsDTO(
            totalForms = totalForms,
            totalUsers = totalUsers,
            totalGroups = totalGroups,
            totalSubmissions = totalSubmissions,
            recentSubmissions = recentSubmissions,
            completedForms = completedForms
        )
    }

    fun getUserStats(userEmail: String): SystemStatsDTO {
        // Get user's forms
        val userForms = formRepository.findByCreatedBy(userEmail)
        val totalForms = userForms.size.toLong()
        
        // Get user's groups
        val userGroups = groupRepository.findByCreatedBy(userEmail)
        val totalGroups = userGroups.size.toLong()
        
        // Get submissions for user's forms
        val userFormIds = userForms.map { it.id }
        val totalSubmissions = if (userFormIds.isNotEmpty()) {
            formSubmissionRepository.countByFormIdIn(userFormIds)
        } else {
            0L
        }
        
        // Recent submissions for user's forms (simplified)
        val recentSubmissions = totalSubmissions
        
        // Completed forms (user's forms with at least one submission)
        val completedForms = userForms.count { form ->
            formSubmissionRepository.countByFormId(form.id) > 0
        }.toLong()
        
        return SystemStatsDTO(
            totalForms = totalForms,
            totalUsers = 1L, // Only the current user
            totalGroups = totalGroups,
            totalSubmissions = totalSubmissions,
            recentSubmissions = recentSubmissions,
            completedForms = completedForms
        )
    }

    fun getFormsWithStats(): List<FormWithStatsDTO> {
        val forms = formRepository.findAll()
        
        return forms.map { form ->
            val submissionCount = formSubmissionRepository.countByFormId(form.id)
            val lastSubmission = formSubmissionRepository.findTopByFormIdOrderBySubmittedAtDesc(form.id)
            
            FormWithStatsDTO(
                id = form.id,
                name = form.name,
                description = form.description,
                createdBy = if (form.createdBy.isNotEmpty() && form.createdBy != "unknown" && form.createdBy != "Unknown Creator") form.createdBy else "Unknown Creator",
                createdAt = form.createdAt,
                lastModified = form.lastModified,
                submissionCount = submissionCount,
                lastSubmissionDate = lastSubmission?.submittedAt
            )
        }
    }

    fun getFormsWithStatsByUser(userEmail: String): List<FormWithStatsDTO> {
        // Get user's own forms
        val userForms = formRepository.findByCreatedBy(userEmail)
        
        // Get user's groups and their assigned forms
        val user = userRepository.findByEmail(userEmail) ?: return emptyList()
        val userGroups = groupMemberRepository.findByUserId(user.id)
        val groupIds = userGroups.map { it.groupId }
        
        val assignedFormIds = if (groupIds.isNotEmpty()) {
            formAssignmentRepository.findFormIdsByGroupIds(groupIds)
        } else {
            emptyList()
        }
        
        // Get all forms the user has access to (own forms + assigned forms)
        val allFormIds = userForms.map { it.id }.toSet() + assignedFormIds.toSet()
        val allForms = formRepository.findAllById(allFormIds)
        
        return allForms.map { form ->
            val submissionCount = formSubmissionRepository.countByFormId(form.id)
            val lastSubmission = formSubmissionRepository.findTopByFormIdOrderBySubmittedAtDesc(form.id)
            
            FormWithStatsDTO(
                id = form.id,
                name = form.name,
                description = form.description,
                createdBy = form.createdBy,
                createdAt = form.createdAt,
                lastModified = form.lastModified,
                submissionCount = submissionCount,
                lastSubmissionDate = lastSubmission?.submittedAt
            )
        }
    }

    fun hasUserAccessToForm(userEmail: String, formId: Long): Boolean {
        // Check if user is the form creator
        val form = formRepository.findById(formId).orElse(null) ?: return false
        if (form.createdBy == userEmail) {
            return true
        }
        
        // Check if user has access through group assignments
        val user = userRepository.findByEmail(userEmail) ?: return false
        val userGroups = groupMemberRepository.findByUserId(user.id)
        val groupIds = userGroups.map { it.groupId }
        
        if (groupIds.isEmpty()) {
            return false
        }
        
        // Check if any of user's groups have this form assigned
        val formAssignments = formAssignmentRepository.findByFormId(formId)
        return formAssignments.any { assignment -> 
            groupIds.contains(assignment.groupId) && assignment.isActive 
        }
    }

    fun getFormById(formId: Long): FormWithStatsDTO? {
        val form = formRepository.findById(formId).orElse(null) ?: return null
        val submissionCount = formSubmissionRepository.countByFormId(form.id)
        val lastSubmission = formSubmissionRepository.findTopByFormIdOrderBySubmittedAtDesc(form.id)
        
        return FormWithStatsDTO(
            id = form.id,
            name = form.name,
            description = form.description,
            createdBy = form.createdBy,
            createdAt = form.createdAt,
            lastModified = form.lastModified,
            submissionCount = submissionCount,
            lastSubmissionDate = lastSubmission?.submittedAt
        )
    }

    fun getFormAnalytics(formId: Long): FormAnalyticsDTO? {
        val form = formRepository.findById(formId).orElse(null) ?: return null
        val submissions = formSubmissionRepository.findByFormId(formId)
        
        val totalSubmissions = submissions.size.toLong()
        
        // Analyze numerical fields from submissions
        val numericalFields = analyzeNumericalFields(submissions)
        
        // Generate chart data based on form fields and submissions
        val chartData = generateChartDataFromSubmissions(submissions, form)
        
        // Recent submissions
        val recentSubmissions = submissions
            .sortedByDescending { 
                try {
                    LocalDateTime.parse(it.submittedAt)
                } catch (e: Exception) {
                    LocalDateTime.now()
                }
            }
            .take(5)
            .map { submission ->
                // Debug: Print the actual submittedBy value from database
                println("DEBUG: Database submittedBy for submission ${submission.id}: '${submission.submittedBy}'")
                
                val finalSubmittedBy = if (submission.submittedBy.isNotEmpty() && submission.submittedBy != "unknown" && submission.submittedBy != "Unknown" && submission.submittedBy != "Unknown User" && submission.submittedBy != "anonymous") {
                    println("DEBUG: Using actual submittedBy: '${submission.submittedBy}'")
                    submission.submittedBy
                } else {
                    println("DEBUG: Using 'Unknown User' as fallback")
                    "Unknown User"
                }
                
                RecentSubmissionDTO(
                    id = submission.id,
                    submittedBy = finalSubmittedBy,
                    submittedAt = submission.submittedAt,
                    fieldCount = try {
                        submission.answers.split(",").size
                    } catch (e: Exception) {
                        0
                    }
                )
            }
        
        return FormAnalyticsDTO(
            formId = form.id,
            formTitle = form.name,
            totalSubmissions = totalSubmissions,
            numericalFields = numericalFields,
            chartData = chartData,
            recentSubmissions = recentSubmissions
        )
    }

    fun getRecentActivity(): List<RecentActivityDTO> {
        val activities = mutableListOf<RecentActivityDTO>()
        var activityId = 1L
        
        // Recent form submissions
        val recentSubmissions = formSubmissionRepository.findTop10ByOrderBySubmittedAtDesc()
        recentSubmissions.forEach { submission ->
            activities.add(
                RecentActivityDTO(
                    id = activityId++,
                    type = "form_submitted",
                    title = "Form Submission",
                    description = "Form was submitted by ${submission.submittedBy}",
                    timestamp = submission.submittedAt,
                    user = submission.submittedBy
                )
            )
        }
        
        // Recent form creations
        val recentForms = formRepository.findTop5ByOrderByCreatedAtDesc()
        recentForms.forEach { form ->
            activities.add(
                RecentActivityDTO(
                    id = activityId++,
                    type = "form_created",
                    title = "New Form Created",
                    description = "${form.name} was created",
                    timestamp = form.createdAt,
                    user = if (form.createdBy.isNotEmpty() && form.createdBy != "unknown" && form.createdBy != "Unknown Creator") form.createdBy else "Unknown Creator"
                )
            )
        }
        
        // Sort by timestamp and return top 10
        return activities.sortedByDescending { it.timestamp }.take(10)
    }

    fun getUserRecentActivity(userEmail: String): List<RecentActivityDTO> {
        val activities = mutableListOf<RecentActivityDTO>()
        var activityId = 1L
        
        // Get user's forms
        val userForms = formRepository.findByCreatedBy(userEmail)
        
        // Recent form submissions for user's forms
        val userFormIds = userForms.map { it.id }
        val recentSubmissions = if (userFormIds.isNotEmpty()) {
            formSubmissionRepository.findByFormIdIn(userFormIds)
        } else {
            emptyList()
        }
        
        recentSubmissions.sortedByDescending { it.submittedAt }.take(5).forEach { submission ->
            activities.add(
                RecentActivityDTO(
                    id = activityId++,
                    type = "form_submitted",
                    title = "Form Submission",
                    description = "Form was submitted by ${submission.submittedBy}",
                    timestamp = submission.submittedAt,
                    user = submission.submittedBy
                )
            )
        }
        
        // Recent form creations by user
        userForms.sortedByDescending { it.createdAt }.take(5).forEach { form ->
            activities.add(
                RecentActivityDTO(
                    id = activityId++,
                    type = "form_created",
                    title = "New Form Created",
                    description = "${form.name} was created",
                    timestamp = form.createdAt,
                    user = form.createdBy
                )
            )
        }
        
        // Sort by timestamp and return top 10
        return activities.sortedByDescending { it.timestamp }.take(10)
    }

    fun getTotalSubmissionsCount(): Long {
        return formSubmissionRepository.count()
    }

    fun getFormDataAsCSV(formId: Long): String {
        val form = formRepository.findById(formId).orElse(null) ?: return "Form not found"
        val submissions = formSubmissionRepository.findByFormId(formId)
        
        if (submissions.isEmpty()) {
            return "No submissions found for this form"
        }
        
        val csvBuilder = StringBuilder()
        
        // Add header
        csvBuilder.append("Submission ID,Submitted By,Submitted At,Answers\n")
        
        // Add data rows
        submissions.forEach { submission ->
            csvBuilder.append("${submission.id},")
            csvBuilder.append("\"${submission.submittedBy}\",")
            csvBuilder.append("\"${submission.submittedAt}\",")
            csvBuilder.append("\"${submission.answers}\"\n")
        }
        
        return csvBuilder.toString()
    }

    fun getFormFieldStats(formId: Long): Map<String, Any> {
        val form = formRepository.findById(formId).orElse(null) ?: return mapOf("error" to "Form not found")
        val submissions = formSubmissionRepository.findByFormId(formId)
        
        // First try to get fields from actual form structure
        val formFields = parseFormFields(form).toMutableList()
        
        // Create a mapping from fieldId to label for matching answers
        val fieldIdToLabel = mutableMapOf<String, String>()
        formFields.forEach { field ->
            fieldIdToLabel[field.id] = field.label
        }
        
        // Also create a reverse mapping from UUID to label for submissions
        val uuidToLabel = mutableMapOf<String, String>()
        formFields.forEach { field ->
            // If the field ID is a UUID, map it to the label
            if (field.id.matches(Regex("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"))) {
                uuidToLabel[field.id] = field.label
            }
        }
        
        // If no fields from form structure, fallback to submission data
        if (formFields.isEmpty()) {
            val submissionFields = parseFormFieldsFromSubmissions(submissions)
            formFields.addAll(submissionFields)
        }
        
        val fieldStats = mutableMapOf<String, Any>()
        
        formFields.forEach { field ->
            when (field.type) {
                "radio", "select", "checkbox", "categorical" -> {
                    val chartData = generateCategoricalChart(submissions, field)
                    // Use label as key instead of field.id
                    fieldStats[field.label] = mapOf(
                        "type" to "categorical",
                        "label" to field.label,
                        "fieldId" to field.id,
                        "chartData" to mapOf(
                            "labels" to chartData.labels,
                            "values" to chartData.values
                        )
                    )
                }
                "number", "rating" -> {
                    val chartData = generateNumericalChart(submissions, field)
                    // Use label as key instead of field.id
                    fieldStats[field.label] = mapOf(
                        "type" to "numerical",
                        "label" to field.label,
                        "fieldId" to field.id,
                        "chartData" to mapOf(
                            "labels" to chartData.labels,
                            "values" to chartData.values
                        )
                    )
                }
            }
        }
        
        return mapOf(
            "formId" to formId,
            "formTitle" to form.name,
            "totalSubmissions" to submissions.size,
            "fieldStats" to fieldStats
        )
    }

    private fun analyzeNumericalFields(submissions: List<org.example.backend.model.database.FormSubmission>): List<NumericalFieldDTO> {
        // Analyze submissions data to extract numerical fields
        val numericalFields = mutableListOf<NumericalFieldDTO>()
        
        if (submissions.isNotEmpty()) {
            try {
                // Analyze submission dates (age of submissions)
                val submissionDates = submissions.mapNotNull { submission ->
                    try {
                        LocalDateTime.parse(submission.submittedAt)
                    } catch (e: Exception) {
                        null
                    }
                }
                
                if (submissionDates.isNotEmpty()) {
                    val now = LocalDateTime.now()
                    val agesInDays = submissionDates.map { ChronoUnit.DAYS.between(it, now).toDouble() }
                    
                    numericalFields.add(
                        NumericalFieldDTO(
                            id = "submission_age",
                            label = "Submission Age (Days)",
                            average = agesInDays.average(),
                            min = agesInDays.minOrNull(),
                            max = agesInDays.maxOrNull()
                        )
                    )
                    
                    // Analyze submission count by day of week
                    val dayOfWeekCounts = submissionDates.groupBy { it.dayOfWeek }
                        .mapValues { it.value.size }
                    
                    if (dayOfWeekCounts.isNotEmpty()) {
                        numericalFields.add(
                            NumericalFieldDTO(
                                id = "day_of_week",
                                label = "Submissions by Day of Week",
                                average = dayOfWeekCounts.values.average(),
                                min = dayOfWeekCounts.values.minOrNull()?.toDouble(),
                                max = dayOfWeekCounts.values.maxOrNull()?.toDouble()
                            )
                        )
                    }
                }
                
                // Analyze actual form field data
                val fieldData = analyzeFormFieldData(submissions)
                numericalFields.addAll(fieldData)
                
            } catch (e: Exception) {
                // If analysis fails, provide default data
                numericalFields.add(
                    NumericalFieldDTO(
                        id = "submission_age",
                        label = "Submission Age (Days)",
                        average = 0.0,
                        min = 0.0,
                        max = 0.0
                    )
                )
            }
        }
        
        return numericalFields
    }
    
    private fun analyzeFormFieldData(submissions: List<org.example.backend.model.database.FormSubmission>): List<NumericalFieldDTO> {
        val numericalFields = mutableListOf<NumericalFieldDTO>()
        
        // Get the form from the first submission to access form structure
        val formId = submissions.firstOrNull()?.formId
        val form = if (formId != null) formRepository.findById(formId).orElse(null) else null
        
        // Create a mapping from fieldId to label from the form structure
        val fieldIdToLabel = mutableMapOf<String, String>()
        if (form != null && form.fields != null) {
            try {
                val typeRef = object : TypeReference<List<FormFieldDTO>>() {}
                val formFields = objectMapper.readValue(form.fields, typeRef)
                formFields.forEach { fieldDto ->
                    val fieldId = fieldDto.id ?: ""
                    val label = fieldDto.label ?: fieldId
                    if (fieldId.isNotEmpty()) {
                        fieldIdToLabel[fieldId] = label
                    }
                }
            } catch (e: Exception) {
                println("DEBUG: Error parsing form fields for label mapping: ${e.message}")
            }
        }
        
        // Collect all field names from submissions
        val allFields = mutableSetOf<String>()
        submissions.forEach { submission ->
            try {
                val answers = parseSubmissionAnswers(submission.answers)
                allFields.addAll(answers.keys)
            } catch (e: Exception) {
                // Skip if parsing fails
            }
        }
        
        // Analyze each field
        allFields.forEach { fieldName ->
            val values = mutableListOf<Double>()
            
            submissions.forEach { submission ->
                try {
                    val answers = parseSubmissionAnswers(submission.answers)
                    val value = answers[fieldName]
                    if (value != null) {
                        val numericValue = value.toDoubleOrNull()
                        if (numericValue != null) {
                            values.add(numericValue)
                        }
                    }
                } catch (e: Exception) {
                    // Skip if parsing fails
                }
            }
            
            if (values.isNotEmpty()) {
                // Use the actual label from form structure, or fallback to field name
                val label = fieldIdToLabel[fieldName] ?: fieldName.replace("_", " ").replaceFirstChar { it.uppercase() }
                
                numericalFields.add(
                    NumericalFieldDTO(
                        id = fieldName,
                        label = label,
                        average = values.average(),
                        min = values.minOrNull(),
                        max = values.maxOrNull()
                    )
                )
            }
        }
        
        return numericalFields
    }

    private fun generateChartDataFromSubmissions(submissions: List<org.example.backend.model.database.FormSubmission>, form: org.example.backend.model.database.Form): ChartDataDTO {
        if (submissions.isEmpty()) {
            return ChartDataDTO(labels = listOf("No Data"), values = listOf(0))
        }
        
        try {
            // First try to get fields from actual form structure
            val formFields = parseFormFields(form)
            
            // If we have fields from form structure, analyze them
            if (formFields.isNotEmpty()) {
                return analyzeFormFieldsForChart(submissions, formFields)
            }
            
            // Fallback to submission data
            val submissionFields = parseFormFieldsFromSubmissions(submissions)
            if (submissionFields.isNotEmpty()) {
                return analyzeFormFieldsForChart(submissions, submissionFields)
            }
            
            // Final fallback to submission date analysis
            return generateSubmissionDateChart(submissions)
            
        } catch (e: Exception) {
            // If chart generation fails, return default data
            return ChartDataDTO(
                labels = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"),
                values = listOf(0, 0, 0, 0, 0, 0, 0)
            )
        }
    }
    
    private fun parseFormFields(form: org.example.backend.model.database.Form): List<FormFieldInfo> {
        val fields = mutableListOf<FormFieldInfo>()
        
        try {
            // Parse actual fields from form structure
            if (form.fields != null && form.fields.isNotEmpty()) {
                println("DEBUG: Parsing form fields from JSON: ${form.fields}")
                
                // Use the class ObjectMapper to parse fields
                
                try {
                    val typeRef = object : TypeReference<List<FormFieldDTO>>() {}
                    val formFields = objectMapper.readValue(form.fields, typeRef)
                    
                    formFields.forEach { fieldDto ->
                        val fieldType = when (fieldDto.type?.lowercase()) {
                            "number", "input" -> "number"
                            "radio", "select", "dropdown" -> "categorical"
                            "checkbox" -> "categorical"
                            "rating" -> "number"
                            "textarea", "text" -> "categorical"
                            "email" -> "categorical"
                            "tel" -> "categorical"
                            else -> "categorical"
                        }
                        
                        val label = fieldDto.label ?: fieldDto.id ?: "Unknown Field"
                        val fieldId = fieldDto.id ?: "field_${fields.size}"
                        
                        fields.add(FormFieldInfo(fieldId, label, fieldType))
                        println("DEBUG: Added real form field: $fieldId -> $label ($fieldType)")
                    }
                    
                    println("DEBUG: Successfully parsed ${fields.size} fields from form structure")
                    return fields
                    
                } catch (e: Exception) {
                    println("DEBUG: Error parsing form fields JSON: ${e.message}")
                    // Fallback to submission-based field extraction
                }
            }
        } catch (e: Exception) {
            println("DEBUG: Error in parseFormFields: ${e.message}")
        }
        
        // If we couldn't parse form fields, return empty list
        // This will force the system to use submission-based extraction
        println("DEBUG: No form fields parsed, will use submission-based extraction")
        return fields
    }
    
    private fun parseFormFieldsFromSubmissions(submissions: List<org.example.backend.model.database.FormSubmission>): List<FormFieldInfo> {
        val fields = mutableListOf<FormFieldInfo>()
        val fieldTypes = mutableMapOf<String, String>()
        val fieldLabels = mutableMapOf<String, String>()
        
        println("DEBUG: Analyzing ${submissions.size} submissions for field extraction")
        
        // Analyze submissions to determine field types and labels
        submissions.forEach { submission ->
            try {
                val answers = parseSubmissionAnswers(submission.answers)
                println("DEBUG: Parsed answers for submission: $answers")
                
                answers.forEach { (fieldName, value) ->
                    // Skip UUID-like field names
                    if (fieldName.matches(Regex("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"))) {
                        println("DEBUG: Skipping UUID field: $fieldName")
                        return@forEach
                    }
                    
                    val fieldType = determineFieldType(fieldName, value)
                    fieldTypes[fieldName] = fieldType
                    
                    // Try to get a better label for the field
                    val label = getFieldLabel(fieldName)
                    fieldLabels[fieldName] = label
                    
                    println("DEBUG: Field: $fieldName -> Type: $fieldType, Label: $label")
                }
            } catch (e: Exception) {
                println("DEBUG: Error parsing submission: ${e.message}")
                // Skip if parsing fails
            }
        }
        
        // Create FormFieldInfo objects
        fieldTypes.forEach { (fieldName, fieldType) ->
            val label = fieldLabels[fieldName] ?: fieldName.replace("_", " ").replaceFirstChar { it.uppercase() }
            fields.add(FormFieldInfo(fieldName, label, fieldType))
            println("DEBUG: Created FormFieldInfo: $fieldName -> $label ($fieldType)")
        }
        
        println("DEBUG: Total fields extracted: ${fields.size}")
        return fields
    }
    
    private fun getFieldLabel(fieldName: String): String {
        // Map common field names to readable labels
        return when (fieldName.lowercase()) {
            "age" -> "سن"
            "gender" -> "جنسیت"
            "department" -> "دپارتمان"
            "education" -> "تحصیلات"
            "experience" -> "تجربه"
            "satisfaction" -> "رضایت"
            "rating" -> "امتیاز"
            "salary" -> "حقوق"
            "name" -> "نام"
            "email" -> "ایمیل"
            "phone" -> "تلفن"
            "address" -> "آدرس"
            "city" -> "شهر"
            "country" -> "کشور"
            "job_title" -> "عنوان شغلی"
            "company" -> "شرکت"
            "years_experience" -> "سال‌های تجربه"
            "skills" -> "مهارت‌ها"
            "languages" -> "زبان‌ها"
            "certifications" -> "گواهینامه‌ها"
            "value" -> "مقدار"
            "fieldid" -> "شناسه فیلد"
            else -> {
                // Try to clean up the field name and make it more readable
                val cleaned = fieldName.replace("_", " ").replace("-", " ")
                if (cleaned.length > 1) {
                    cleaned.replaceFirstChar { it.uppercase() }
                } else {
                    fieldName
                }
            }
        }
    }
    
    private fun determineFieldType(fieldName: String, value: String): String {
        // Try to parse as number
        if (value.toDoubleOrNull() != null) {
            return "number"
        }
        
        // Check for common categorical fields
        val categoricalFields = listOf(
            "gender", "department", "education", "experience", "satisfaction", "rating",
            "name", "email", "phone", "address", "city", "country", "job_title", 
            "company", "skills", "languages", "certifications"
        )
        if (categoricalFields.any { fieldName.lowercase().contains(it) }) {
            return "categorical"
        }
        
        // Check for common numerical fields
        val numericalFields = listOf("age", "salary", "years_experience", "score", "count", "amount")
        if (numericalFields.any { fieldName.lowercase().contains(it) }) {
            return "number"
        }
        
        // Default to categorical
        return "categorical"
    }
    
    private fun analyzeFormFieldsForChart(submissions: List<org.example.backend.model.database.FormSubmission>, fields: List<FormFieldInfo>): ChartDataDTO {
        // Find the first suitable field for charting
        val chartField = fields.firstOrNull { it.type in listOf("radio", "select", "checkbox", "rating", "categorical") }
            ?: fields.firstOrNull { it.type == "number" }
            ?: return generateSubmissionDateChart(submissions)
        
        // Create a mapping from fieldId to label for matching answers
        val fieldIdToLabel = mutableMapOf<String, String>()
        fields.forEach { field ->
            fieldIdToLabel[field.id] = field.label
        }
        
        // Also create a reverse mapping from UUID to label for submissions
        val uuidToLabel = mutableMapOf<String, String>()
        fields.forEach { field ->
            // If the field ID is a UUID, map it to the label
            if (field.id.matches(Regex("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"))) {
                uuidToLabel[field.id] = field.label
            }
        }
        
        return when (chartField.type) {
            "radio", "select", "checkbox", "categorical" -> generateCategoricalChart(submissions, chartField)
            "number", "rating" -> generateNumericalChart(submissions, chartField)
            else -> generateSubmissionDateChart(submissions)
        }
    }
    
    private fun generateCategoricalChart(submissions: List<org.example.backend.model.database.FormSubmission>, field: FormFieldInfo): ChartDataDTO {
        // Analyze real submission data for categorical fields
        val fieldAnswers = mutableMapOf<String, Int>()
        
        submissions.forEach { submission ->
            try {
                // Parse answers from submission
                val answers = parseSubmissionAnswers(submission.answers)
                
                // Try to find the answer using fieldId (UUID)
                val fieldValue = answers[field.id]
                
                if (fieldValue != null) {
                    fieldAnswers[fieldValue] = fieldAnswers.getOrDefault(fieldValue, 0) + 1
                }
            } catch (e: Exception) {
                // If parsing fails, skip this submission
            }
        }
        
        // If no real data found, return empty chart
        if (fieldAnswers.isEmpty()) {
            return ChartDataDTO(labels = listOf("No Data"), values = listOf(0))
        }
        
        val categories = fieldAnswers.keys.toList()
        val values = fieldAnswers.values.toList()
        
        return ChartDataDTO(labels = categories, values = values)
    }
    
    private fun generateNumericalChart(submissions: List<org.example.backend.model.database.FormSubmission>, field: FormFieldInfo): ChartDataDTO {
        // Analyze real submission data for numerical fields
        val numericalValues = mutableListOf<Double>()
        
        submissions.forEach { submission ->
            try {
                // Parse answers from submission
                val answers = parseSubmissionAnswers(submission.answers)
                
                // Try to find the answer using fieldId
                val fieldValue = answers[field.id]
                
                if (fieldValue != null) {
                    val numericValue = fieldValue.toDoubleOrNull()
                    if (numericValue != null) {
                        numericalValues.add(numericValue)
                    }
                }
            } catch (e: Exception) {
                // If parsing fails, skip this submission
            }
        }
        
        // If no real data found, return empty chart
        if (numericalValues.isEmpty()) {
            return ChartDataDTO(labels = listOf("No Data"), values = listOf(0))
        }
        
        // Create histogram bins based on the data
        val min = numericalValues.minOrNull() ?: 0.0
        val max = numericalValues.maxOrNull() ?: 0.0
        val range = max - min
        
        val binCount = 5
        val binSize = if (range > 0) range / binCount else 1.0
        
        val bins = mutableMapOf<String, Int>()
        
        numericalValues.forEach { value ->
            val binIndex = ((value - min) / binSize).toInt().coerceIn(0, binCount - 1)
            val binStart = min + (binIndex * binSize)
            val binEnd = min + ((binIndex + 1) * binSize)
            val binLabel = "${binStart.toInt()}-${binEnd.toInt()}"
            bins[binLabel] = bins.getOrDefault(binLabel, 0) + 1
        }
        
        val labels = bins.keys.toList()
        val values = bins.values.toList()
        
        return ChartDataDTO(labels = labels, values = values)
    }
    
    private fun generateSubmissionDateChart(submissions: List<org.example.backend.model.database.FormSubmission>): ChartDataDTO {
        val now = LocalDateTime.now()
        val last7Days = (0..6).map { now.minusDays(it.toLong()) }
        
        val labels = last7Days.map { it.format(DateTimeFormatter.ofPattern("MMM dd")) }.reversed()
        val values = last7Days.reversed().map { day ->
            submissions.count { submission ->
                try {
                    LocalDateTime.parse(submission.submittedAt).toLocalDate() == day.toLocalDate()
                } catch (e: Exception) {
                    false
                }
            }
        }
        
        return ChartDataDTO(labels = labels, values = values)
    }
    
    data class FormFieldInfo(
        val id: String,
        val label: String,
        val type: String
    )
    
    private fun parseSubmissionAnswers(answersString: String): Map<String, String> {
        val answers = mutableMapOf<String, String>()
        
        try {
            // Debug: Print the raw input
            println("DEBUG: Raw answers string: $answersString")
            
            // Try to parse as proper JSON first using ObjectMapper
            try {
                val typeRef = object : TypeReference<List<FormAnswerDTO>>() {}
                val jsonAnswers = objectMapper.readValue(answersString, typeRef)
                
                jsonAnswers.forEach { answerObj ->
                    val fieldId = answerObj.fieldId
                    val value = answerObj.value?.toString() ?: ""
                    
                    // Use fieldId as field name
                    if (fieldId.isNotEmpty() && value.isNotEmpty()) {
                        answers[fieldId] = value
                        println("DEBUG: Added field from JSON: $fieldId = $value")
                    }
                }
                
                if (answers.isNotEmpty()) {
                    println("DEBUG: Successfully parsed JSON answers: $answers")
                    return answers
                }
            } catch (e: Exception) {
                println("DEBUG: JSON parsing with ObjectMapper failed: ${e.message}")
            }
            
            // Fallback to manual JSON parsing
            if (answersString.startsWith("{") || answersString.startsWith("[")) {
                val jsonAnswers = parseJsonAnswers(answersString)
                println("DEBUG: Parsed JSON answers manually: $jsonAnswers")
                val filteredAnswers = filterValidFields(jsonAnswers)
                println("DEBUG: Filtered answers: $filteredAnswers")
                return filteredAnswers
            } else {
                // Parse as key-value pairs
                val simpleAnswers = parseSimpleAnswers(answersString)
                println("DEBUG: Parsed simple answers: $simpleAnswers")
                val filteredAnswers = filterValidFields(simpleAnswers)
                println("DEBUG: Filtered answers: $filteredAnswers")
                return filteredAnswers
            }
        } catch (e: Exception) {
            println("DEBUG: Error parsing answers: ${e.message}")
            // If parsing fails, return empty map
        }
        
        return answers
    }
    
    private fun parseJsonAnswers(answersString: String): Map<String, String> {
        val answers = mutableMapOf<String, String>()
        
        try {
            // Remove outer brackets if it's an array
            var cleanString = answersString.trim()
            if (cleanString.startsWith("[") && cleanString.endsWith("]")) {
                cleanString = cleanString.substring(1, cleanString.length - 1)
            }
            
            // Split by },{ to get individual objects
            val objects = cleanString.split("},{")
            
            objects.forEach { obj ->
                val cleanObj = obj.trim().removePrefix("{").removeSuffix("}")
                val pairs = cleanObj.split(",")
                
                var currentFieldId = ""
                var currentValue = ""
                var currentLabel = ""
                var currentType = ""
                
                pairs.forEach { pair ->
                    val keyValue = pair.trim().split(":")
                    if (keyValue.size == 2) {
                        val key = keyValue[0].trim().removeSurrounding("\"")
                        val value = keyValue[1].trim().removeSurrounding("\"")
                        
                        when {
                            key == "fieldId" -> {
                                currentFieldId = value
                            }
                            key == "value" -> {
                                currentValue = value
                            }
                            key == "label" -> {
                                currentLabel = value
                            }
                            key == "type" -> {
                                currentType = value
                            }
                        }
                    }
                }
                
                // Try to extract meaningful field name
                val fieldName = extractMeaningfulFieldName(currentFieldId, currentLabel, currentType)
                
                // If we have both field name and value, add to answers
                if (fieldName.isNotEmpty() && currentValue.isNotEmpty()) {
                    answers[fieldName] = currentValue
                    println("DEBUG: Added field: $fieldName = $currentValue (from fieldId: $currentFieldId, label: $currentLabel)")
                }
            }
        } catch (e: Exception) {
            println("DEBUG: JSON parsing failed: ${e.message}")
            // If JSON parsing fails, try simple parsing
            return parseSimpleAnswers(answersString)
        }
        
        println("DEBUG: Final parsed answers: $answers")
        return answers
    }
    
    private fun extractMeaningfulFieldName(fieldId: String, label: String, type: String): String {
        // If we have a meaningful label, use it
        if (label.isNotEmpty() && !isUUID(label)) {
            return label
        }
        
        // If fieldId is not a UUID and looks meaningful, use it
        if (fieldId.isNotEmpty() && !isUUID(fieldId)) {
            return fieldId
        }
        
        // Try to infer from type
        return when (type.lowercase()) {
            "number", "input" -> "age"
            "select", "dropdown" -> "department"
            "radio" -> "gender"
            "checkbox" -> "skills"
            "textarea" -> "comments"
            "email" -> "email"
            "tel" -> "phone"
            else -> ""
        }
    }
    
    private fun extractFieldName(key: String): String {
        // Handle different key formats
        return when {
            key.contains("fieldId") -> {
                // Extract field name from fieldId
                val fieldMatch = Regex("\"fieldId\":\\s*\"([^\"]+)\"").find(key)
                fieldMatch?.groupValues?.get(1) ?: key
            }
            key.contains("label") -> {
                // Extract field name from label
                val labelMatch = Regex("\"label\":\\s*\"([^\"]+)\"").find(key)
                labelMatch?.groupValues?.get(1) ?: key
            }
            key.contains("value") -> {
                // Skip value keys, we want the field name
                ""
            }
            key.contains("type") -> {
                // Skip type keys, we want the field name
                ""
            }
            else -> key
        }
    }
    
    private fun parseSimpleAnswers(answersString: String): Map<String, String> {
        val answers = mutableMapOf<String, String>()
        
        // Split by comma and parse key-value pairs
        val pairs = answersString.split(",")
        pairs.forEach { pair ->
            val keyValue = pair.trim().split(":")
            if (keyValue.size == 2) {
                val key = keyValue[0].trim()
                val value = keyValue[1].trim()
                answers[key] = value
            }
        }
        
        return answers
    }
    
    private fun isUUID(fieldName: String): Boolean {
        return fieldName.matches(Regex("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"))
    }
    
    private fun filterValidFields(answers: Map<String, String>): Map<String, String> {
        return answers.filter { (fieldName, _) ->
            !isUUID(fieldName) && fieldName.isNotEmpty() && fieldName != "value" && fieldName != "type"
        }
    }
} 