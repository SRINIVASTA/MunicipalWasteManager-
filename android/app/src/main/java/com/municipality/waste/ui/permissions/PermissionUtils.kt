package com.municipality.waste.ui.permissions

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.compose.ManagedActivityResultLauncher
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat

/**
 * Checks if runtime camera and fine location permissions are granted.
 */
fun hasRequiredPermissions(context: Context): Boolean {
    val cameraGranted = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.CAMERA
    ) == PackageManager.PERMISSION_GRANTED

    val locationGranted = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.ACCESS_FINE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED

    return cameraGranted && locationGranted
}

/**
 * Compose wrapper for requesting CAMERA and ACCESS_FINE_LOCATION simultaneously
 * with an informative municipal rationale dialog if denied.
 */
@Composable
fun rememberReportPermissionLauncher(
    onAllGranted: () -> Unit,
    onDenied: (deniedPermissions: List<String>) -> Unit
): ManagedActivityResultLauncher<Array<String>, Map<String, Boolean>> {
    return rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissionsMap ->
        val cameraGranted = permissionsMap[Manifest.permission.CAMERA] ?: false
        val fineLocationGranted = permissionsMap[Manifest.permission.ACCESS_FINE_LOCATION] ?: false

        if (cameraGranted && fineLocationGranted) {
            onAllGranted()
        } else {
            val denied = permissionsMap.filter { !it.value }.keys.toList()
            onDenied(denied)
        }
    }
}

/**
 * Material 3 Dialog explaining why Camera & GPS permissions are needed for municipal dispatch.
 */
@Composable
fun PermissionRationaleDialog(
    show: Boolean,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (show) {
        AlertDialog(
            onDismissRequest = onDismiss,
            icon = {
                Icon(
                    imageVector = Icons.Default.CameraAlt,
                    contentDescription = null
                )
            },
            title = {
                Text(text = "Camera & Precise Location Required")
            },
            text = {
                Text(
                    text = "To dispatch sanitation teams accurately, the municipality requires:\n\n" +
                            "• Camera: To capture photographic evidence of the waste site.\n" +
                            "• GPS Location: To pin the exact coordinates for the collection vehicle route."
                )
            },
            confirmButton = {
                TextButton(onClick = onConfirm) {
                    Text("Allow Permissions")
                }
            },
            dismissButton = {
                TextButton(onClick = onDismiss) {
                    Text("Cancel")
                }
            }
        )
    }
}
