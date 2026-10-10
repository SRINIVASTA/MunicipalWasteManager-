package com.municipality.waste.ui.screens

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
import java.util.concurrent.Executor

/**
 * CameraX integrated screen for snapping photo of the waste incident.
 * Features live viewfinder, grid overlay guidelines for evidence, and capture shutter.
 */
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

    // Fallback standard TakePicture intent launcher in case CameraX hardware access is restricted
    var tempPhotoUri by remember { mutableStateOf<Uri?>(null) }
    val takePictureLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success && tempPhotoUri != null) {
            onPhotoCaptured(tempPhotoUri!!)
        }
    }

    Box(modifier = modifier.fillMaxSize().background(Color.Black)) {
        // CameraX Preview View
        AndroidView(
            factory = { ctx ->
                val previewView = PreviewView(ctx)
                val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)

                cameraProviderFuture.addListener({
                    val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()
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

                    try {
                        cameraProvider.unbindAll()
                        cameraProvider.bindToLifecycle(
                            lifecycleOwner,
                            cameraSelector,
                            preview,
                            capture
                        )
                    } catch (exc: Exception) {
                        exc.printStackTrace()
                    }
                }, ContextCompat.getMainExecutor(ctx))

                previewView
            },
            modifier = Modifier.fillMaxSize()
        )

        // Viewfinder reticle overlay for municipal inspection
        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .fillMaxWidth(0.85f)
                .aspectRatio(1f)
                .border(2.dp, Color.White.copy(alpha = 0.6f), RoundedCornerShape(16.dp))
        )

        // Top Controls: Back button & Flash indicator
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 40.dp, start = 16.dp, end = 16.dp)
                .align(Alignment.TopCenter),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBackClicked,
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(alpha = 0.5f))
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = Color.White
                )
            }

            Surface(
                color = Color.Black.copy(alpha = 0.6f),
                shape = RoundedCornerShape(20.dp)
            ) {
                Text(
                    text = "Waste Inspection Camera",
                    color = Color.White,
                    style = MaterialTheme.typography.labelMedium,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                )
            }

            // Quick Gallery / System Camera fallback button
            IconButton(
                onClick = {
                    val file = createTempImageFile(context)
                    val uri = FileProvider.getUriForFile(
                        context,
                        "${context.packageName}.fileprovider",
                        file
                    )
                    tempPhotoUri = uri
                    takePictureLauncher.launch(uri)
                },
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(alpha = 0.5f))
            ) {
                Icon(
                    imageVector = Icons.Default.PhotoLibrary,
                    contentDescription = "System Camera / Gallery",
                    tint = Color.White
                )
            }
        }

        // Bottom Controls: Shutter Button
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 36.dp)
                .align(Alignment.BottomCenter),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Frame the garbage pile and tap capture",
                color = Color.White.copy(alpha = 0.85f),
                style = MaterialTheme.typography.bodySmall
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Switch Camera Lens
                IconButton(
                    onClick = {
                        lensFacing = if (lensFacing == CameraSelector.LENS_FACING_BACK) {
                            CameraSelector.LENS_FACING_FRONT
                        } else {
                            CameraSelector.LENS_FACING_BACK
                        }
                    },
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Color.Black.copy(alpha = 0.5f))
                ) {
                    Icon(
                        imageVector = Icons.Default.FlipCameraAndroid,
                        contentDescription = "Flip Lens",
                        tint = Color.White
                    )
                }

                // Shutter Button
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .border(4.dp, Color.White, CircleShape)
                        .padding(6.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Button(
                        onClick = {
                            if (!isCapturing) {
                                isCapturing = true
                                val photoFile = createTempImageFile(context)
                                val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

                                imageCapture?.takePicture(
                                    outputOptions,
                                    ContextCompat.getMainExecutor(context),
                                    object : ImageCapture.OnImageSavedCallback {
                                        override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                                            isCapturing = false
                                            val savedUri = Uri.fromFile(photoFile)
                                            onPhotoCaptured(savedUri)
                                        }

                                        override fun onError(exc: ImageCaptureException) {
                                            isCapturing = false
                                            // Fallback to TakePicture Intent launcher
                                            val uri = FileProvider.getUriForFile(
                                                context,
                                                "${context.packageName}.fileprovider",
                                                photoFile
                                            )
                                            tempPhotoUri = uri
                                            takePictureLauncher.launch(uri)
                                        }
                                    }
                                ) ?: run {
                                    // If ImageCapture wasn't initialized, use system camera contract
                                    val uri = FileProvider.getUriForFile(
                                        context,
                                        "${context.packageName}.fileprovider",
                                        photoFile
                                    )
                                    tempPhotoUri = uri
                                    takePictureLauncher.launch(uri)
                                    isCapturing = false
                                }
                            }
                        },
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ForestPrimary
                        ),
                        modifier = Modifier.fillMaxSize(),
                        enabled = !isCapturing
                    ) {
                        if (isCapturing) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(24.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Camera,
                                contentDescription = "Take Photo",
                                tint = Color.White,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }
                }

                // Placeholder for symmetrical alignment
                Spacer(modifier = Modifier.size(48.dp))
            }
        }
    }
}

private fun createTempImageFile(context: Context): File {
    val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
    val storageDir = context.cacheDir
    return File.createTempFile("WASTE_${timeStamp}_", ".jpg", storageDir)
}
