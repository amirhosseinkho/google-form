package org.example.backend.model.dto.api

data class SystemStatsDTO(
    val totalForms: Long,
    val totalUsers: Long,
    val totalGroups: Long,
    val totalSubmissions: Long,
    val recentSubmissions: Long,
    val completedForms: Long
)

data class FormWithStatsDTO(
    val id: Long,
    val name: String,
    val description: String,
    val createdBy: String?,
    val createdAt: String?,
    val lastModified: String?,
    val submissionCount: Long,
    val lastSubmissionDate: String?
)

data class FormAnalyticsDTO(
    val formId: Long,
    val formTitle: String,
    val totalSubmissions: Long,
    val numericalFields: List<NumericalFieldDTO>,
    val chartData: ChartDataDTO,
    val recentSubmissions: List<RecentSubmissionDTO>
)

data class NumericalFieldDTO(
    val id: String,
    val label: String,
    val average: Double?,
    val min: Double?,
    val max: Double?
)

data class ChartDataDTO(
    val labels: List<String>,
    val values: List<Int>
)

data class RecentSubmissionDTO(
    val id: Long,
    val submittedBy: String,
    val submittedAt: String,
    val fieldCount: Int
)

data class RecentActivityDTO(
    val id: Long,
    val type: String, // 'form_created', 'form_submitted', 'user_joined', 'group_created'
    val title: String,
    val description: String,
    val timestamp: String,
    val user: String
) 