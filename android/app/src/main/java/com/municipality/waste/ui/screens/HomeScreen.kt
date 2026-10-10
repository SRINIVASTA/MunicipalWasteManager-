package com.municipality.waste.ui.screens

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
                actions = {
                    IconButton(onClick = { /* Open info dialog */ }) {
                        Icon(
                            imageVector = Icons.Outlined.Info,
                            contentDescription = "About Municipal Waste Service"
                        )
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
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Spotted Waste or Overflow?",
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                                color = ForestPrimary
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Snap a photo. Our system captures precise GPS coordinates and automatically dispatches local sanitation crews.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Prominent Button Inside Card as well
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

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.GpsFixed,
                                contentDescription = null,
                                tint = ForestPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Auto-GPS Lock",
                                style = MaterialTheme.typography.labelSmall,
                                color = ForestPrimary
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Bolt,
                                contentDescription = null,
                                tint = ForestPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Direct City Dispatch",
                                style = MaterialTheme.typography.labelSmall,
                                color = ForestPrimary
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.VerifiedUser,
                                contentDescription = null,
                                tint = ForestPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Track Ticket",
                                style = MaterialTheme.typography.labelSmall,
                                color = ForestPrimary
                            )
                        }
                    }
                }
            }

            // How it works 3-step guide
            Text(
                text = "How Reporting Works",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                WorkflowStepItem(
                    stepNumber = "1",
                    icon = Icons.Default.PhotoCamera,
                    title = "Capture Evidence",
                    description = "Take a clear photo of the waste pile, overflowing bin, or discarded items."
                )
                WorkflowStepItem(
                    stepNumber = "2",
                    icon = Icons.Default.MyLocation,
                    title = "Precise GPS Pinning",
                    description = "Google Play Services instantly acquires meter-accurate coordinates and nearest address."
                )
                WorkflowStepItem(
                    stepNumber = "3",
                    icon = Icons.Default.LocalShipping,
                    title = "Sanitation Dispatch",
                    description = "A ticket is issued and routed to the sector's municipal cleanup truck."
                )
            }

            // Municipal Service Metrics
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    StatMetric(value = "24/7", label = "City Dispatch")
                    StatMetric(value = "< 4 hrs", label = "Avg Response")
                    StatMetric(value = "98.2%", label = "Resolution Rate")
                }
            }

            Spacer(modifier = Modifier.height(72.dp)) // Padding for FAB
        }
    }
}

@Composable
private fun WorkflowStepItem(
    stepNumber: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        tonalElevation = 1.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(ForestPrimaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = ForestPrimary,
                    modifier = Modifier.size(24.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "$stepNumber. $title",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun StatMetric(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = ForestPrimary
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
