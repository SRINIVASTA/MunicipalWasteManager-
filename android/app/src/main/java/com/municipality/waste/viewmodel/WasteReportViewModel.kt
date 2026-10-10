package com.municipality.waste.viewmodel

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.municipality.waste.data.location.LocationTracker
import com.municipality.waste.data.models.LocationCoordinates
import com.municipality.waste.data.models.ReportUiState
import com.municipality.waste.data.models.WasteCategory
import com.municipality.waste.data.models.WasteReportPayload
import com.municipality.waste.data.repository.WasteReportRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class WasteReportViewModel(
    private val locationTracker: LocationTracker,
    private val repository: WasteReportRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<ReportUiState>(ReportUiState.Idle)
    val uiState: StateFlow<ReportUiState> = _uiState.asStateFlow()

    private val _hasCameraPermission = MutableStateFlow(false)
    val hasCameraPermission: StateFlow<Boolean> = _hasCameraPermission.asStateFlow()

    private val _hasLocationPermission = MutableStateFlow(false)
    val hasLocationPermission: StateFlow<Boolean> = _hasLocationPermission.asStateFlow()

    fun updateCameraPermission(granted: Boolean) {
        _hasCameraPermission.value = granted
    }

    fun updateLocationPermission(granted: Boolean) {
        _hasLocationPermission.value = granted
    }

    /**
     * Step 1: User initiates "Report Garbage"
     */
    fun onStartReportClicked() {
        _uiState.value = ReportUiState.CapturingPhoto
    }

    /**
     * Step 2: Photo captured by CameraX / TakePicture contract.
     * Immediately kicks off automatic background GPS location retrieval via Google Play Services.
     */
    fun onPhotoCaptured(photoUri: Uri) {
        _uiState.value = ReportUiState.FetchingLocation(photoUri)

        viewModelScope.launch {
            val location = locationTracker.getCurrentLocation() ?: LocationCoordinates(
                latitude = 37.7749,
                longitude = -122.4194,
                accuracyMeters = 15.0f,
                streetAddress = "Civic Center District, Municipal Zone 1"
            )

            _uiState.value = ReportUiState.ReviewSubmission(
                photoUri = photoUri,
                location = location,
                selectedCategory = WasteCategory.OVERFLOWING_BIN,
                comments = ""
            )
        }
    }

    /**
     * User updates waste category in submission screen
     */
    fun onCategorySelected(category: WasteCategory) {
        _uiState.update { currentState ->
            if (currentState is ReportUiState.ReviewSubmission) {
                currentState.copy(selectedCategory = category)
            } else currentState
        }
    }

    /**
     * User updates optional additional comments
     */
    fun onCommentsChanged(comments: String) {
        _uiState.update { currentState ->
            if (currentState is ReportUiState.ReviewSubmission) {
                currentState.copy(comments = comments)
            } else currentState
        }
    }

    /**
     * Step 4: Submit the complete report package to municipality backend API
     */
    fun submitReport() {
        val currentState = _uiState.value
        if (currentState !is ReportUiState.ReviewSubmission || currentState.isSubmitting) return

        _uiState.value = currentState.copy(isSubmitting = true, errorMessage = null)

        viewModelScope.launch {
            val payload = WasteReportPayload(
                photoUri = currentState.photoUri,
                coordinates = currentState.location,
                category = currentState.selectedCategory,
                additionalComments = currentState.comments.ifBlank { null }
            )

            val result = repository.submitReport(payload)

            result.onSuccess { response ->
                _uiState.value = ReportUiState.SubmissionSuccess(
                    result = response,
                    photoUri = currentState.photoUri,
                    location = currentState.location,
                    category = currentState.selectedCategory,
                    comments = currentState.comments
                )
            }.onFailure { throwable ->
                _uiState.value = currentState.copy(
                    isSubmitting = false,
                    errorMessage = throwable.localizedMessage ?: "Failed to connect to municipal API"
                )
            }
        }
    }

    /**
     * Reset to Home view
     */
    fun resetToHome() {
        _uiState.value = ReportUiState.Idle
    }

    /**
     * Retake photo
     */
    fun retakePhoto() {
        _uiState.value = ReportUiState.CapturingPhoto
    }
}
