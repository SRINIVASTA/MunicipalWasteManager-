package com.municipality.waste.data.location

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

/**
 * Production-ready implementation using Google Play Services FusedLocationProviderClient.
 * Fetches high-accuracy GPS coordinates and reverse-geocodes into a human-readable address.
 */
class DefaultLocationTracker(
    private val context: Context,
    private val client: FusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)
) : LocationTracker {

    @SuppressLint("MissingPermission")
    override suspend fun getCurrentLocation(): LocationCoordinates? {
        return withContext(Dispatchers.IO) {
            try {
                // Request current high accuracy location with Google Play Services
                val cancellationTokenSource = CancellationTokenSource()
                
                val location: Location? = suspendCancellableCoroutine { continuation ->
                    client.getCurrentLocation(
                        Priority.PRIORITY_HIGH_ACCURACY,
                        cancellationTokenSource.token
                    ).addOnSuccessListener { loc: Location? ->
                        continuation.resume(loc)
                    }.addOnFailureListener {
                        // Fallback to last known location if immediate lock fails
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
                } else {
                    null
                }
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }

    /**
     * Resolves GPS lat/lng into a municipal street address.
     */
    private suspend fun reverseGeocode(latitude: Double, longitude: Double): String {
        return withContext(Dispatchers.IO) {
            try {
                val geocoder = Geocoder(context, Locale.getDefault())
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    suspendCancellableCoroutine { continuation ->
                        geocoder.getFromLocation(latitude, longitude, 1, object : Geocoder.GeocodeListener {
                            override fun onGeocode(addresses: MutableList<Address>) {
                                val address = addresses.firstOrNull()
                                val formatted = formatAddress(address, latitude, longitude)
                                continuation.resume(formatted)
                            }
                            override fun onError(errorMessage: String?) {
                                continuation.resume("Lat: %.5f, Lon: %.5f".format(latitude, longitude))
                            }
                        })
                    }
                } else {
                    @Suppress("DEPRECATION")
                    val addresses = geocoder.getFromLocation(latitude, longitude, 1)
                    val address = addresses?.firstOrNull()
                    formatAddress(address, latitude, longitude)
                }
            } catch (e: Exception) {
                "Lat: %.5f, Lon: %.5f (Offline/No Geocoder)".format(latitude, longitude)
            }
        }
    }

    private fun formatAddress(address: Address?, lat: Double, lon: Double): String {
        return if (address != null) {
            val thoroughfare = address.thoroughfare ?: address.featureName ?: "Public Way"
            val subThoroughfare = address.subThoroughfare?.let { "$it " } ?: ""
            val locality = address.locality ?: address.subAdminArea ?: "City Sector"
            val postalCode = address.postalCode?.let { ", $it" } ?: ""
            "$subThoroughfare$thoroughfare, $locality$postalCode"
        } else {
            "Near %.5f, %.5f".format(lat, lon)
        }
    }
}
