package com.trackify.spenddetection.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.core.app.NotificationCompat
import com.trackify.spenddetection.R
import com.trackify.spenddetection.data.AppDatabase
import com.trackify.spenddetection.data.TransactionRepository
import com.trackify.spenddetection.model.Direction
import com.trackify.spenddetection.model.ParsedTransaction
import com.trackify.spenddetection.parser.NotificationParser
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Event-driven NotificationListenerService that filters incoming notifications from
 * allowed banking / UPI apps and parses financial transaction details on-device.
 *
 * PRIVACY GUARANTEE:
 * 1. Event-driven operation (no background polling loops).
 * 2. On-device parsing and storage only. Raw notification text is NEVER logged or transmitted off-device.
 */
class TrackifyNotificationListenerService : NotificationListenerService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var repository: TransactionRepository
    private lateinit var prefs: SharedPreferences

    companion object {
        const val CHANNEL_ID = "trackify_spend_alerts"
        const val PREFS_NAME = "trackify_settings"
        const val PREF_GLOBAL_ENABLED = "global_enabled"
        const val PREF_APP_PREFIX = "app_enabled_"

        val DEFAULT_ALLOW_LIST = mapOf(
            "com.google.android.apps.nbu.paisa.user" to "GPay",
            "com.phonepe.app" to "PhonePe",
            "net.one97.paytm" to "Paytm",
            "com.snapwork.hdfc" to "HDFC Bank",
            "com.sbi.lotusintouch" to "SBI Freedom",
            "com.csam.icici.bank.imobile" to "ICICI iMobile"
        )
    }

    override fun onCreate() {
        super.onCreate()
        val dao = AppDatabase.getDatabase(applicationContext).transactionDao()
        repository = TransactionRepository(dao)
        prefs = applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        createNotificationChannel()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return

        // 1. Check Global Switch
        val isGlobalEnabled = prefs.getBoolean(PREF_GLOBAL_ENABLED, true)
        if (!isGlobalEnabled) return

        // 2. Check Package Allow-List & Per-App Switch
        val packageName = sbn.packageName ?: return
        val appLabel = DEFAULT_ALLOW_LIST[packageName]
            ?: if (packageName == applicationContext.packageName) "Trackify Test" else null
            ?: return

        val isAppEnabled = prefs.getBoolean(PREF_APP_PREFIX + packageName, true)
        if (!isAppEnabled) return

        // Extract notification content
        val extras = sbn.notification?.extras ?: return
        val title = extras.getCharSequence("android.title")?.toString() ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val bigText = extras.getCharSequence("android.bigText")?.toString() ?: ""

        val combinedContent = "$title $text $bigText".trim()
        if (combinedContent.isBlank()) return

        // Dedup key based on package and notification ID/key
        val notificationKey = "${sbn.packageName}_${sbn.id}_${sbn.key}"
        val postTime = sbn.postTime

        // 3. Parse on-device
        val parsed: ParsedTransaction = NotificationParser.parse(
            text = combinedContent,
            sourceApp = appLabel,
            timestamp = postTime
        ) ?: return

        // 4. Save to Room database (deduplicating updates vs new events)
        serviceScope.launch {
            val isBrandNew = repository.saveParsedTransaction(parsed, notificationKey)
            if (isBrandNew) {
                // Surface follow-up push alert for brand new spend events
                showLocalSpendAlert(parsed)
            }
        }
    }

    private fun showLocalSpendAlert(parsed: ParsedTransaction) {
        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val dirText = if (parsed.direction == Direction.DEBIT) "spent" else "received"
        val counterpartyText = if (!parsed.counterparty.isNull_or_blank()) " at ${parsed.counterparty}" else ""
        val alertText = "You $dirText ₹${parsed.amount}$counterpartyText via ${parsed.sourceApp}"

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("New Transaction Detected 💳")
            .setContentText(alertText)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(parsed.timestamp.toInt(), notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Spend Alerts",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for detected spend transactions"
            }
            val notificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}

// String extension helper for null or blank
private fun String?.isNull_or_blank(): Boolean {
    return this == null || this.trim().isEmpty()
}
