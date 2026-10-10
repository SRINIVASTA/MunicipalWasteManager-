package com.municipality.waste.data.repository

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

/**
 * Production-ready mock implementation simulating an HTTP multipart/JSON request
 * to a municipal public works dispatch REST API (e.g., POST /api/v1/waste-reports).
 */
class MockWasteReportRepository : WasteReportRepository {

    private val reportHistory = mutableListOf<WasteReportPayload>()

    override suspend fun submitReport(payload: WasteReportPayload): Result<MunicipalitySubmissionResult> {
        return withContext(Dispatchers.IO) {
            try {
                // Simulate network latency (1.8 seconds) for uploading photo and payload
                delay(1800)

                // Validate payload
                if (payload.coordinates.latitude == 0.0 && payload.coordinates.longitude == 0.0) {
                    return@withContext Result.failure(
                        IllegalArgumentException("Invalid GPS coordinates. Please ensure location services are enabled.")
                    )
                }

                // Generate municipal tracking identifier
                val year = SimpleDateFormat("yyyy", Locale.US).format(Date(payload.timestamp))
                val randomSeq = 10000 + Random.nextInt(90000)
                val trackingId = "MUN-$year-$randomSeq"

                // Determine assigned municipal sanitation district based on coordinates
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

                // Save to local cache
                reportHistory.add(0, payload)

                Result.success(response)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun getRecentReports(): List<WasteReportPayload> {
        return withContext(Dispatchers.IO) {
            reportHistory.toList()
        }
    }
}
