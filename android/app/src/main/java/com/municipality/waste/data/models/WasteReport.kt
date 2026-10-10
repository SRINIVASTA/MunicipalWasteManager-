package com.municipality.waste.data.models

import android.net.Uri

/**
 * Encapsulates precise GPS coordinates and reverse-geocoded address.
 */
data class LocationCoordinates(
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Float = 0f,
    val streetAddress: String = "Fetching address...",
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Waste categorization for municipal triage.
 */
enum class WasteCategory(val displayName: String, val description: String) {
    OVERFLOWING_BIN("Overflowing Bin", "Public trash can or dumpster exceeded capacity"),
    ILLEGAL_DUMPING("Illegal Dumping", "Piles of debris, trash bags, or waste discarded in unauthorized spots"),
    HAZARDOUS_WASTE("Hazardous Material", "Chemicals, batteries, medical supplies, or sharp items"),
    BULKY_ITEMS("Bulky Furniture / Appliances", "Sofas, mattresses, appliances, or tree branches blocking walkways"),
    LITTER_STREET("Street / Sidewalk Litter", "Scattered litter in public parks, sidewalks, or curbs")
}

/**
 * Payload sent to the municipality backend API.
 */
data class WasteReportPayload(
    val photoUri: Uri,
    val coordinates: LocationCoordinates,
    val category: WasteCategory,
    val additionalComments: String?,
    val timestamp: Long = System.currentTimeMillis(),
    val deviceModel: String = android.os.Build.MODEL
)

/**
 * Response received from municipal backend service.
 */
data class MunicipalitySubmissionResult(
    val trackingId: String,
    val confirmationStatus: String,
    val assignedDistrict: String,
    val estimatedResolutionHours: Int,
    val timestamp: Long
)

/**
 * UI State machine for reporting flow.
 */
sealed interface ReportUiState {
    data object Idle : ReportUiState
    data object CapturingPhoto : ReportUiState
    data class FetchingLocation(val photoUri: Uri) : ReportUiState
    data class ReviewSubmission(
        val photoUri: Uri,
        val location: LocationCoordinates,
        val selectedCategory: WasteCategory = WasteCategory.OVERFLOWING_BIN,
        val comments: String = "",
        val isSubmitting: Boolean = false,
        val errorMessage: String? = null
    ) : ReportUiState
    data class SubmissionSuccess(
        val result: MunicipalitySubmissionResult,
        val photoUri: Uri,
        val location: LocationCoordinates,
        val category: WasteCategory,
        val comments: String?
    ) : ReportUiState
    data class SubmissionError(
        val message: String,
        val previousState: ReviewSubmission
    ) : ReportUiState
}
