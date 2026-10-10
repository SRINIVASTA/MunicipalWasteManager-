package com.municipality.waste

import android.Manifest
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.municipality.waste.data.location.DefaultLocationTracker
import com.municipality.waste.data.models.ReportUiState
import com.municipality.waste.data.repository.MockWasteReportRepository
import com.municipality.waste.ui.permissions.PermissionRationaleDialog
import com.municipality.waste.ui.permissions.hasRequiredPermissions
import com.municipality.waste.ui.permissions.rememberReportPermissionLauncher
import com.municipality.waste.ui.screens.CameraCaptureScreen
import com.municipality.waste.ui.screens.HomeScreen
import com.municipality.waste.ui.screens.SubmissionScreen
import com.municipality.waste.ui.screens.SuccessScreen
import com.municipality.waste.ui.theme.MunicipalWasteManagerTheme
import com.municipality.waste.viewmodel.WasteReportViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val locationTracker = DefaultLocationTracker(applicationContext)
        val repository = MockWasteReportRepository()

        setContent {
            MunicipalWasteManagerTheme {
                val viewModel: WasteReportViewModel = viewModel {
                    WasteReportViewModel(locationTracker, repository)
                }

                val uiState by viewModel.uiState.collectAsState()
                var showPermissionRationale by remember { mutableStateOf(false) }

                // Runtime permission launcher for Camera and Fine Location
                val permissionLauncher = rememberReportPermissionLauncher(
                    onAllGranted = {
                        viewModel.onStartReportClicked()
                    },
                    onDenied = {
                        showPermissionRationale = true
                    }
                )

                // Rationale dialog if user declined permissions
                PermissionRationaleDialog(
                    show = showPermissionRationale,
                    onConfirm = {
                        showPermissionRationale = false
                        permissionLauncher.launch(
                            arrayOf(
                                Manifest.permission.CAMERA,
                                Manifest.permission.ACCESS_FINE_LOCATION
                            )
                        )
                    },
                    onDismiss = {
                        showPermissionRationale = false
                    }
                )

                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    AnimatedContent(
                        targetState = uiState,
                        transitionSpec = { fadeIn() togetherWith fadeOut() },
                        label = "ScreenTransition",
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) { state ->
                        when (state) {
                            is ReportUiState.Idle -> {
                                HomeScreen(
                                    onReportGarbageClicked = {
                                        if (hasRequiredPermissions(this@MainActivity)) {
                                            viewModel.onStartReportClicked()
                                        } else {
                                            permissionLauncher.launch(
                                                arrayOf(
                                                    Manifest.permission.CAMERA,
                                                    Manifest.permission.ACCESS_FINE_LOCATION
                                                )
                                            )
                                        }
                                    }
                                )
                            }

                            is ReportUiState.CapturingPhoto -> {
                                CameraCaptureScreen(
                                    onPhotoCaptured = { uri ->
                                        viewModel.onPhotoCaptured(uri)
                                    },
                                    onBackClicked = {
                                        viewModel.resetToHome()
                                    }
                                )
                            }

                            is ReportUiState.FetchingLocation -> {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    androidx.compose.foundation.layout.Column(
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        CircularProgressIndicator()
                                        androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(8.dp))
                                        Text(text = "Acquiring precise GPS location & street address...")
                                    }
                                }
                            }

                            is ReportUiState.ReviewSubmission -> {
                                SubmissionScreen(
                                    photoUri = state.photoUri,
                                    location = state.location,
                                    selectedCategory = state.selectedCategory,
                                    comments = state.comments,
                                    isSubmitting = state.isSubmitting,
                                    errorMessage = state.errorMessage,
                                    onCategorySelected = { category ->
                                        viewModel.onCategorySelected(category)
                                    },
                                    onCommentsChanged = { comments ->
                                        viewModel.onCommentsChanged(comments)
                                    },
                                    onRetakePhoto = {
                                        viewModel.retakePhoto()
                                    },
                                    onSubmitClicked = {
                                        viewModel.submitReport()
                                    },
                                    onCancelClicked = {
                                        viewModel.resetToHome()
                                    }
                                )
                            }

                            is ReportUiState.SubmissionSuccess -> {
                                SuccessScreen(
                                    result = state.result,
                                    location = state.location,
                                    category = state.category,
                                    comments = state.comments,
                                    onDoneClicked = {
                                        viewModel.resetToHome()
                                    },
                                    onReportAnotherClicked = {
                                        viewModel.onStartReportClicked()
                                    }
                                )
                            }

                            is ReportUiState.SubmissionError -> {
                                // Fallback into review screen with error message
                                SubmissionScreen(
                                    photoUri = state.previousState.photoUri,
                                    location = state.previousState.location,
                                    selectedCategory = state.previousState.selectedCategory,
                                    comments = state.previousState.comments,
                                    isSubmitting = false,
                                    errorMessage = state.message,
                                    onCategorySelected = { viewModel.onCategorySelected(it) },
                                    onCommentsChanged = { viewModel.onCommentsChanged(it) },
                                    onRetakePhoto = { viewModel.retakePhoto() },
                                    onSubmitClicked = { viewModel.submitReport() },
                                    onCancelClicked = { viewModel.resetToHome() }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
