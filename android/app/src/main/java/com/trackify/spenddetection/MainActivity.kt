package com.trackify.spenddetection

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.EventRepeat
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.lifecycleScope
import com.trackify.spenddetection.data.AppDatabase
import com.trackify.spenddetection.data.TransactionRepository
import com.trackify.spenddetection.service.NotificationPermissionHelper
import com.trackify.spenddetection.ui.ChatScreen
import com.trackify.spenddetection.ui.DebugNotificationPoster
import com.trackify.spenddetection.ui.PermissionScreen
import com.trackify.spenddetection.ui.SettingsScreen
import com.trackify.spenddetection.ui.TransactionFeedScreen
import com.trackify.spenddetection.ui.UpcomingPaymentsScreen
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var repository: TransactionRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate()

        val dao = AppDatabase.getDatabase(applicationContext).transactionDao()
        repository = TransactionRepository(dao)

        setContent {
            MainAppScreen(
                repository = repository,
                onGrantPermissionClick = {
                    val intent = NotificationPermissionHelper.getNotificationAccessSettingsIntent()
                    startActivity(intent)
                }
            )
        }
    }

    override fun onResume() {
        super.onResume()
        // Check notification access permission status on resume
        val isGranted = NotificationPermissionHelper.isNotificationAccessGranted(this)
        // Refresh UI state automatically on resume
    }
}

@Composable
fun MainAppScreen(
    repository: TransactionRepository,
    onGrantPermissionClick: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Feed, 1: Settings, 2: Debug, 3: Onboarding
    val isPermissionGranted = NotificationPermissionHelper.isNotificationAccessGranted(context)
    val coroutineScope = rememberCoroutineScope()

    val transactions by repository.allTransactions.collectAsState(initial = emptyList())

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF1E293B),
                contentColor = Color.White
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Receipt, contentDescription = "Feed") },
                    label = { Text("Feed") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6366F1),
                        indicatorColor = Color(0xFF334155)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6366F1),
                        indicatorColor = Color(0xFF334155)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.EventRepeat, contentDescription = "Recurring") },
                    label = { Text("Recurring") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6366F1),
                        indicatorColor = Color(0xFF334155)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.BugReport, contentDescription = "Debug") },
                    label = { Text("Debug") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6366F1),
                        indicatorColor = Color(0xFF334155)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 },
                    icon = { Icon(Icons.Default.AutoAwesome, contentDescription = "AI Chat") },
                    label = { Text("AI Chat") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6366F1),
                        indicatorColor = Color(0xFF334155)
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 5,
                    onClick = { selectedTab = 5 },
                    icon = { Icon(Icons.Default.Shield, contentDescription = "Privacy") },
                    label = { Text("Privacy") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF6366F1),
                        indicatorColor = Color(0xFF334155)
                    )
                )
            }
        }
    ) { innerPadding ->
        Modifier.padding(innerPadding)

        val recurringDao = remember { AppDatabase.getDatabase(context).recurringPaymentDao() }
        val recurringPayments by recurringDao.getAllRecurringPayments().collectAsState(initial = emptyList())

        when (selectedTab) {
            0 -> TransactionFeedScreen(
                transactions = transactions,
                onUpdateTransaction = { entity ->
                    coroutineScope.launch {
                        repository.updateTransaction(entity)
                    }
                },
                onDeleteTransaction = { entity ->
                    coroutineScope.launch {
                        repository.deleteTransaction(entity)
                    }
                }
            )
            1 -> SettingsScreen()
            2 -> UpcomingPaymentsScreen(
                recurringPayments = recurringPayments,
                localTransactions = transactions,
                onSaveRecurringPayment = { payment ->
                    coroutineScope.launch {
                        recurringDao.upsertRecurringPayment(payment)
                    }
                },
                onDeleteRecurringPayment = { payment ->
                    coroutineScope.launch {
                        recurringDao.deleteRecurringPayment(payment)
                    }
                },
                onUpdateStatus = { id, status ->
                    coroutineScope.launch {
                        recurringDao.updateStatus(id, status)
                    }
                }
            )
            3 -> DebugNotificationPoster()
            4 -> ChatScreen(transactions = transactions)
            5 -> PermissionScreen(
                isGranted = isPermissionGranted,
                onGrantClick = onGrantPermissionClick,
                onContinueClick = { selectedTab = 0 }
            )
        }
    }
}
