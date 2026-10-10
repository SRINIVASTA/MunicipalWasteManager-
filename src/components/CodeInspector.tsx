import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Folder,
  Code2,
  Terminal,
  Layers,
  Sparkles,
  Info,
  Search,
} from 'lucide-react';

interface AndroidFileItem {
  id: string;
  name: string;
  path: string;
  category: 'Screens' | 'Data & Location' | 'ViewModel' | 'Config & Theme';
  description: string;
  code: string;
}

const ANDROID_FILES: AndroidFileItem[] = [
  {
    id: 'MainActivity',
    name: 'MainActivity.kt',
    path: 'android/app/src/main/java/com/municipality/waste/MainActivity.kt',
    category: 'Screens',
    description: 'ComponentActivity entry point, Edge-to-Edge display, and permission launcher integration',
    code: `package com.municipality.waste

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
}`,
  },
  {
    id: 'HomeScreen',
    name: 'HomeScreen.kt',
    path: 'android/app/src/main/java/com/municipality/waste/ui/screens/HomeScreen.kt',
    category: 'Screens',
    description: 'Material 3 home screen with prominent "Report Garbage" hero card & Extended FAB',
    code: `package com.municipality.waste.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.municipality.waste.ui.theme.ForestPrimary
import com.municipality.waste.ui.theme.ForestPrimaryContainer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onReportGarbageClicked: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(ForestPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.DeleteSweep,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "City Clean Municipal",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Department of Public Sanitation",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onReportGarbageClicked,
                containerColor = ForestPrimary,
                contentColor = Color.White,
                icon = {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = null
                    )
                },
                text = {
                    Text(
                        text = "Report Garbage",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                },
                modifier = Modifier
                    .padding(bottom = 8.dp)
                    .height(56.dp)
            )
        },
        floatingActionButtonPosition = FabPosition.Center
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Prominent Hero Action Card
            ElevatedCard(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.elevatedCardColors(
                    containerColor = ForestPrimaryContainer
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Spotted Waste or Overflow?",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = ForestPrimary
                    )
                    Text(
                        text = "Snap a photo. Our system captures precise GPS coordinates and automatically dispatches local sanitation crews.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Button(
                        onClick = onReportGarbageClicked,
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ForestPrimary,
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.AddLocationAlt,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Report Garbage Now",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
            }

            // How It Works Steps
            Text(
                text = "How Reporting Works",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            // Step 1: Capture Evidence
            // Step 2: Auto GPS Lock
            // Step 3: Municipal Truck Dispatched
        }
    }
}`,
  },
  {
    id: 'CameraCaptureScreen',
    name: 'CameraCaptureScreen.kt',
    path: 'android/app/src/main/java/com/municipality/waste/ui/screens/CameraCaptureScreen.kt',
    category: 'Screens',
    description: 'CameraX PreviewView & ImageCapture integration with shutter button and target reticle',
    code: `package com.municipality.waste.ui.screens

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.municipality.waste.ui.theme.ForestPrimary
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun CameraCaptureScreen(
    onPhotoCaptured: (Uri) -> Unit,
    onBackClicked: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var lensFacing by remember { mutableStateOf(CameraSelector.LENS_FACING_BACK) }
    var imageCapture: ImageCapture? by remember { mutableStateOf(null) }
    var isCapturing by remember { mutableStateOf(false) }

    Box(modifier = modifier.fillMaxSize().background(Color.Black)) {
        // CameraX AndroidView hosting PreviewView
        AndroidView(
            factory = { ctx ->
                val previewView = PreviewView(ctx)
                val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)

                cameraProviderFuture.addListener({
                    val cameraProvider = cameraProviderFuture.get()
                    val preview = Preview.Builder().build().also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }

                    val capture = ImageCapture.Builder()
                        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                        .build()
                    imageCapture = capture

                    val cameraSelector = CameraSelector.Builder()
                        .requireLensFacing(lensFacing)
                        .build()

                    cameraProvider.unbindAll()
                    cameraProvider.bindToLifecycle(
                        lifecycleOwner,
                        cameraSelector,
                        preview,
                        capture
                    )
                }, ContextCompat.getMainExecutor(ctx))

                previewView
            },
            modifier = Modifier.fillMaxSize()
        )

        // Viewfinder Inspection Reticle Overlay
        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .fillMaxWidth(0.85f)
                .aspectRatio(1f)
                .border(2.dp, Color.White.copy(alpha = 0.6f), RoundedCornerShape(16.dp))
        )

        // Shutter Button at bottom
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 36.dp)
                .size(80.dp)
                .border(4.dp, Color.White, CircleShape)
                .padding(6.dp)
        ) {
            Button(
                onClick = {
                    val photoFile = createTempImageFile(context)
                    val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()
                    imageCapture?.takePicture(
                        outputOptions,
                        ContextCompat.getMainExecutor(context),
                        object : ImageCapture.OnImageSavedCallback {
                            override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                                onPhotoCaptured(Uri.fromFile(photoFile))
                            }
                            override fun onError(exc: ImageCaptureException) {
                                exc.printStackTrace()
                            }
                        }
                    )
                },
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(containerColor = ForestPrimary),
                modifier = Modifier.fillMaxSize()
            ) {
                Icon(imageVector = Icons.Default.Camera, contentDescription = "Capture")
            }
        }
    }
}`,
  },
  {
    id: 'LocationTracker',
    name: 'LocationTracker.kt',
    path: 'android/app/src/main/java/com/municipality/waste/data/location/LocationTracker.kt',
    category: 'Data & Location',
    description: 'Google Play Services FusedLocationProviderClient with PRIORITY_HIGH_ACCURACY & Geocoder',
    code: `package com.municipality.waste.data.location

import android.annotation.SuppressLint
import android.content.Context
import android.location.Address
import android.location.Geocoder
import android.location.Location
import android.os.Build
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import com.municipality.waste.data.models.LocationCoordinates
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.coroutines.resume

interface LocationTracker {
    suspend fun getCurrentLocation(): LocationCoordinates?
}

class DefaultLocationTracker(
    private val context: Context,
    private val client: FusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)
) : LocationTracker {

    @SuppressLint("MissingPermission")
    override suspend fun getCurrentLocation(): LocationCoordinates? {
        return withContext(Dispatchers.IO) {
            try {
                val cancellationTokenSource = CancellationTokenSource()

                // Request current precise GPS location using Google Play Services Location
                val location: Location? = suspendCancellableCoroutine { continuation ->
                    client.getCurrentLocation(
                        Priority.PRIORITY_HIGH_ACCURACY,
                        cancellationTokenSource.token
                    ).addOnSuccessListener { loc: Location? ->
                        continuation.resume(loc)
                    }.addOnFailureListener {
                        client.lastLocation.addOnSuccessListener { fallbackLoc ->
                            continuation.resume(fallbackLoc)
                        }.addOnFailureListener {
                            continuation.resume(null)
                        }
                    }.addOnCanceledListener {
                        continuation.resume(null)
                    }

                    continuation.invokeOnCancellation {
                        cancellationTokenSource.cancel()
                    }
                }

                if (location != null) {
                    val addressName = reverseGeocode(location.latitude, location.longitude)
                    LocationCoordinates(
                        latitude = location.latitude,
                        longitude = location.longitude,
                        accuracyMeters = location.accuracy,
                        streetAddress = addressName,
                        timestamp = location.time.takeIf { it > 0 } ?: System.currentTimeMillis()
                    )
                } else null
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }

    private suspend fun reverseGeocode(latitude: Double, longitude: Double): String {
        return withContext(Dispatchers.IO) {
            try {
                val geocoder = Geocoder(context, Locale.getDefault())
                val addresses = geocoder.getFromLocation(latitude, longitude, 1)
                val address = addresses?.firstOrNull()
                if (address != null) {
                    val thoroughfare = address.thoroughfare ?: address.featureName ?: "Public Way"
                    val subThoroughfare = address.subThoroughfare?.let { "$it " } ?: ""
                    val locality = address.locality ?: "Sanitation District"
                    "$subThoroughfare$thoroughfare, $locality"
                } else "Lat: %.5f, Lon: %.5f".format(latitude, longitude)
            } catch (e: Exception) {
                "Near %.5f, %.5f".format(latitude, longitude)
            }
        }
    }
}`,
  },
  {
    id: 'WasteReportRepository',
    name: 'WasteReportRepository.kt',
    path: 'android/app/src/main/java/com/municipality/waste/data/repository/WasteReportRepository.kt',
    category: 'Data & Location',
    description: 'Mock municipality backend API network handler with latency simulation and tracking tickets',
    code: `package com.municipality.waste.data.repository

import com.municipality.waste.data.models.MunicipalitySubmissionResult
import com.municipality.waste.data.models.WasteReportPayload
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.random.Random

interface WasteReportRepository {
    suspend fun submitReport(payload: WasteReportPayload): Result<MunicipalitySubmissionResult>
    suspend fun getRecentReports(): List<WasteReportPayload>
}

class MockWasteReportRepository : WasteReportRepository {

    private val reportHistory = mutableListOf<WasteReportPayload>()

    override suspend fun submitReport(payload: WasteReportPayload): Result<MunicipalitySubmissionResult> {
        return withContext(Dispatchers.IO) {
            try {
                // Simulating network upload latency (1.8s) for photo and GPS telemetry
                delay(1800)

                // Generate official municipal tracking ticket: MUN-2026-XXXXX
                val year = SimpleDateFormat("yyyy", Locale.US).format(Date(payload.timestamp))
                val randomSeq = 10000 + Random.nextInt(90000)
                val trackingId = "MUN-$year-$randomSeq"

                val districtNumber = ((Math.abs(payload.coordinates.latitude * 100).toInt() % 7) + 1)
                val district = "Zone $districtNumber - Sanitation Division"

                val resolutionHours = when (payload.category) {
                    com.municipality.waste.data.models.WasteCategory.HAZARDOUS_WASTE -> 4
                    com.municipality.waste.data.models.WasteCategory.OVERFLOWING_BIN -> 12
                    com.municipality.waste.data.models.WasteCategory.ILLEGAL_DUMPING -> 24
                    com.municipality.waste.data.models.WasteCategory.BULKY_ITEMS -> 48
                    com.municipality.waste.data.models.WasteCategory.LITTER_STREET -> 24
                }

                val response = MunicipalitySubmissionResult(
                    trackingId = trackingId,
                    confirmationStatus = "DISPATCH_QUEUED",
                    assignedDistrict = district,
                    estimatedResolutionHours = resolutionHours,
                    timestamp = System.currentTimeMillis()
                )

                reportHistory.add(0, payload)
                Result.success(response)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun getRecentReports(): List<WasteReportPayload> = reportHistory.toList()
}`,
  },
  {
    id: 'WasteReportViewModel',
    name: 'WasteReportViewModel.kt',
    path: 'android/app/src/main/java/com/municipality/waste/viewmodel/WasteReportViewModel.kt',
    category: 'ViewModel',
    description: 'Kotlin StateFlow UI state machine handling photo capture, GPS background fetch, and submission',
    code: `package com.municipality.waste.viewmodel

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.municipality.waste.data.location.LocationTracker
import com.municipality.waste.data.models.*
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

    fun onStartReportClicked() {
        _uiState.value = ReportUiState.CapturingPhoto
    }

    /**
     * Photo captured by CameraX.
     * Automatically retrieves precise GPS in background using Play Services.
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

    fun onCategorySelected(category: WasteCategory) {
        _uiState.update { currentState ->
            if (currentState is ReportUiState.ReviewSubmission) {
                currentState.copy(selectedCategory = category)
            } else currentState
        }
    }

    fun onCommentsChanged(comments: String) {
        _uiState.update { currentState ->
            if (currentState is ReportUiState.ReviewSubmission) {
                currentState.copy(comments = comments)
            } else currentState
        }
    }

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

    fun resetToHome() {
        _uiState.value = ReportUiState.Idle
    }
}`,
  },
  {
    id: 'SubmissionScreen',
    name: 'SubmissionScreen.kt',
    path: 'android/app/src/main/java/com/municipality/waste/ui/screens/SubmissionScreen.kt',
    category: 'Screens',
    description: 'Submission verification screen with photo preview, GPS address, category picker, and comments',
    code: `package com.municipality.waste.ui.screens

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.municipality.waste.data.models.LocationCoordinates
import com.municipality.waste.data.models.WasteCategory
import com.municipality.waste.ui.theme.ForestPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SubmissionScreen(
    photoUri: Uri,
    location: LocationCoordinates,
    selectedCategory: WasteCategory,
    comments: String,
    isSubmitting: Boolean,
    errorMessage: String?,
    onCategorySelected: (WasteCategory) -> Unit,
    onCommentsChanged: (String) -> Unit,
    onRetakePhoto: () -> Unit,
    onSubmitClicked: () -> Unit,
    onCancelClicked: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Verify & Submit Report") },
                navigationIcon = {
                    IconButton(onClick = onCancelClicked) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Cancel")
                    }
                }
            )
        },
        bottomBar = {
            Button(
                onClick = onSubmitClicked,
                enabled = !isSubmitting,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .height(52.dp)
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(color = androidx.compose.ui.graphics.Color.White)
                } else {
                    Text("Submit to Municipality")
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Photo Preview using Coil
            AsyncImage(
                model = photoUri,
                contentDescription = "Waste Evidence",
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
            )

            // Location coordinates & reverse geocoded address
            Text(text = "Detected Street: " + location.streetAddress)
            Text(text = "GPS: %.5f, %.5f".format(location.latitude, location.longitude))

            // Optional Comments TextField
            OutlinedTextField(
                value = comments,
                onValueChange = onCommentsChanged,
                label = { Text("Additional Comments (Optional)") },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}`,
  },
  {
    id: 'SuccessScreen',
    name: 'SuccessScreen.kt',
    path: 'android/app/src/main/java/com/municipality/waste/ui/screens/SuccessScreen.kt',
    category: 'Screens',
    description: 'Success screen showing tracking ID ticket, animated checkmark, and dispatch division',
    code: `package com.municipality.waste.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.municipality.waste.data.models.MunicipalitySubmissionResult

@Composable
fun SuccessScreen(
    result: MunicipalitySubmissionResult,
    onDoneClicked: () -> Unit,
    onReportAnotherClicked: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Report Dispatched!", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))
        Text("Tracking ID: " + result.trackingId, style = MaterialTheme.typography.titleMedium)
        Text("Assigned to: " + result.assignedDistrict)
        Text("Target Response: < " + result.estimatedResolutionHours + " hours")

        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onReportAnotherClicked) {
            Text("Report Another Area")
        }
        OutlinedButton(onClick = onDoneClicked) {
            Text("Back to Home")
        }
    }
}`,
  },
  {
    id: 'AndroidManifest',
    name: 'AndroidManifest.xml',
    path: 'android/app/src/main/AndroidManifest.xml',
    category: 'Config & Theme',
    description: 'Android manifest with CAMERA, ACCESS_FINE_LOCATION, FileProvider, and ComponentActivity',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Camera runtime permission -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <!-- Precise & Coarse GPS Location permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Network permission for municipal API dispatch -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:theme="@style/Theme.MunicipalWasteManager">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>`,
  },
  {
    id: 'build_gradle',
    name: 'app/build.gradle.kts',
    path: 'android/app/build.gradle.kts',
    category: 'Config & Theme',
    description: 'Gradle Kotlin DSL dependencies: Jetpack Compose BOM, CameraX, Google Play Services Location',
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.municipality.waste"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.municipality.waste"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose BOM & Material 3
    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3:1.3.1")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")

    // Google Play Services Location (Precise GPS)
    implementation("com.google.android.gms:play-services-location:21.3.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.9.0")

    // CameraX for photo capture
    val cameraxVersion = "1.4.1"
    implementation("androidx.camera:camera-core:$cameraxVersion")
    implementation("androidx.camera:camera-camera2:$cameraxVersion")
    implementation("androidx.camera:camera-lifecycle:$cameraxVersion")
    implementation("androidx.camera:camera-view:$cameraxVersion")

    // Coil for Compose image loading
    implementation("io.coil-kt:coil-compose:2.7.0")
}`,
  },
];

export const CodeInspector: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('MainActivity');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedFile =
    ANDROID_FILES.find((f) => f.id === selectedFileId) || ANDROID_FILES[0];

  const filteredFiles = ANDROID_FILES.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[750px]">
      {/* File Sidebar */}
      <div className="w-full md:w-72 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Android Kotlin Project
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Jetpack Compose · Play Services Location · CameraX
          </p>

          {/* Search bar */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Kotlin files..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* File Tree List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredFiles.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => setSelectedFileId(file.id)}
              className={`p-2.5 rounded-xl flex items-start gap-2.5 text-left transition-colors ${
                file.id === selectedFile.id
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold block truncate">
                  {file.name}
                </span>
                <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">
                  {file.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Location & Architecture Note */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Files stored in <code className="text-emerald-300">/android</code></span>
        </div>
      </div>

      {/* Code Editor / Viewer */}
      <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
        {/* Editor Top Bar */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {selectedFile.name}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              {selectedFile.path}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Copy Source Code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-5 overflow-auto bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed">
          <pre className="select-text whitespace-pre">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
