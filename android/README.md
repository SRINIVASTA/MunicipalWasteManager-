# EcoClean - Municipal Waste Management (Native Android Jetpack Compose)

A production-grade native Android application written in **Kotlin** with **Jetpack Compose**, built for municipal waste reporting and sanitation dispatch.

## Features Implemented
1. **Material 3 UI with Prominent "Report Garbage" Button**:
   - Clean, modern layout matching official municipal sanitation workflows.
   - High-contrast touch targets ($\ge 48$dp) and thumb-zone optimized Floating Action Button (FAB).
2. **Camera Integration**:
   - Integrated CameraX PreviewView and ImageCapture with capture reticle overlay.
   - Support for lens switching (back/front) and fallback to system camera contract (`ActivityResultContracts.TakePicture`) via secure `FileProvider`.
3. **Automatic Background GPS Retrieval**:
   - Uses **Google Play Services Location** (`FusedLocationProviderClient`) with `Priority.PRIORITY_HIGH_ACCURACY`.
   - Android `Geocoder` reverse geocoding translates raw latitude/longitude coordinates into a street address automatically.
4. **Verification & Submission Screen**:
   - Preview of the captured photo evidence.
   - Fetched location details: exact latitude and longitude, precision accuracy rating ($\pm 3$m to $15$m), and street address.
   - Waste categorization (Overflowing Bin, Illegal Dumping, Hazardous Material, Bulky Furniture, Street Litter).
   - Optional text field for "Additional Comments" (landmarks, gate codes, safety hazards).
5. **Mock Network Request Handler & Municipality Dispatch API**:
   - Implements `WasteReportRepository` simulating multipart HTTP dispatch with realistic latency (1.8s).
   - Generates municipal tracking ID (e.g. `MUN-2026-XXXXX`), calculates district division routing, and assigns target resolution SLA.
6. **Robust Android Runtime Permission Flow**:
   - Elegant permission handling for `Manifest.permission.CAMERA` and `Manifest.permission.ACCESS_FINE_LOCATION` with rationale dialogs explaining civic necessity.

## Project Structure
```
android/
├── settings.gradle.kts
├── build.gradle.kts
└── app/
    ├── build.gradle.kts
    └── src/main/
        ├── AndroidManifest.xml
        ├── res/xml/file_paths.xml
        └── java/com/municipality/waste/
            ├── MainActivity.kt
            ├── data/
            │   ├── models/WasteReport.kt
            │   ├── location/LocationTracker.kt
            │   └── repository/WasteReportRepository.kt
            ├── viewmodel/WasteReportViewModel.kt
            ├── ui/
            │   ├── permissions/PermissionUtils.kt
            │   ├── screens/
            │   │   ├── HomeScreen.kt
            │   │   ├── CameraCaptureScreen.kt
            │   │   ├── SubmissionScreen.kt
            │   │   └── SuccessScreen.kt
            │   └── theme/
            │       ├── Color.kt
            │       ├── Type.kt
            │       └── Theme.kt
```

## How to Run in Android Studio
1. Open Android Studio (Ladybug / Iguana or later).
2. Select **Open** and point to the `android/` directory.
3. Sync Gradle project with files.
4. Run on an Android emulator running Android 8.0+ (API 26+) or physical device.
