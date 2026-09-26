package com.trackify.spenddetection.ui

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.trackify.spenddetection.service.TrackifyNotificationListenerService

@Composable
fun SettingsScreen() {
    val context = LocalContext.current
    val prefs: SharedPreferences = remember {
        context.getSharedPreferences(
            TrackifyNotificationListenerService.PREFS_NAME,
            Context.MODE_PRIVATE
        )
    }

    var globalEnabled by remember {
        mutableStateOf(
            prefs.getBoolean(
                TrackifyNotificationListenerService.PREF_GLOBAL_ENABLED,
                true
            )
        )
    }

    val appToggleStates = remember {
        mutableStateMapOf<String, Boolean>().apply {
            TrackifyNotificationListenerService.DEFAULT_ALLOW_LIST.keys.forEach { pkg ->
                put(
                    pkg,
                    prefs.getBoolean(
                        TrackifyNotificationListenerService.PREF_APP_PREFIX + pkg,
                        true
                    )
                )
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
    ) {
        Text(
            text = "Detection Settings",
            color = Color.White,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Global Master Toggle Card
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Global Spend Detection",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = if (globalEnabled) "Active and monitoring notifications" else "Paused",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }

                Switch(
                    checked = globalEnabled,
                    onCheckedChange = { newState ->
                        globalEnabled = newState
                        prefs.edit()
                            .putBoolean(
                                TrackifyNotificationListenerService.PREF_GLOBAL_ENABLED,
                                newState
                            )
                            .apply()
                    },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = Color(0xFF10B981)
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Monitored App Sources",
            color = Color(0xFF94A3B8),
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.height(12.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            LazyColumn(
                modifier = Modifier.padding(vertical = 8.dp)
            ) {
                val allowListEntries =
                    TrackifyNotificationListenerService.DEFAULT_ALLOW_LIST.entries.toList()
                items(allowListEntries) { (pkg, label) ->
                    val isChecked = appToggleStates[pkg] ?: true

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = label,
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = pkg,
                                color = Color(0xFF64748B),
                                fontSize = 11.sp
                            )
                        }

                        Switch(
                            checked = isChecked && globalEnabled,
                            enabled = globalEnabled,
                            onCheckedChange = { newState ->
                                appToggleStates[pkg] = newState
                                prefs.edit()
                                    .putBoolean(
                                        TrackifyNotificationListenerService.PREF_APP_PREFIX + pkg,
                                        newState
                                    )
                                    .apply()
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = Color(0xFF6366F1)
                            )
                        )
                    }
                    Divider(color = Color(0xFF334155), thickness = 0.5.dp)
                }
            }
        }
    }
}
