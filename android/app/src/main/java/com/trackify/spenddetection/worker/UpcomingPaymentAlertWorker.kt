package com.trackify.spenddetection.worker

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.trackify.spenddetection.MainActivity
import com.trackify.spenddetection.R
import com.trackify.spenddetection.data.AppDatabase
import com.trackify.spenddetection.recurring.AlertFilterEngine
import java.util.concurrent.TimeUnit

class UpcomingPaymentAlertWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    companion object {
        const val CHANNEL_ID = "upcoming_payments_channel"
        const val WORK_NAME = "UpcomingPaymentAlertWorker"

        fun scheduleDailyCheck(context: Context) {
            val workRequest = PeriodicWorkRequestBuilder<UpcomingPaymentAlertWorker>(
                1, TimeUnit.DAYS
            ).build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                workRequest
            )
        }
    }

    override suspend fun doWork(): Result {
        return try {
            val db = AppDatabase.getDatabase(applicationContext)
            val recurringDao = db.recurringPaymentDao()

            val activePayments = recurringDao.getActiveRecurringPaymentsList()
            if (activePayments.isEmpty()) return Result.success()

            val prefs = applicationContext.getSharedPreferences("trackify_settings", Context.MODE_PRIVATE)
            val defaultLeadDays = prefs.getInt("alert_lead_days", 3)
            val today = System.currentTimeMillis()

            // Pure filter evaluation
            val paymentsToAlert = AlertFilterEngine.getPaymentsToAlert(
                payments = activePayments,
                defaultLeadDays = defaultLeadDays,
                today = today
            )

            if (paymentsToAlert.isNotEmpty()) {
                createNotificationChannel()

                paymentsToAlert.forEach { payment ->
                    val daysUntilDue = ((payment.nextDueDate - today) / (24 * 60 * 60 * 1000L)).toInt().coerceAtLeast(0)
                    showUpcomingNotification(payment.id, payment.displayMerchant, payment.amount, daysUntilDue)

                    // Mark as alerted for this due cycle to prevent duplicate daily alerts
                    val updated = payment.copy(lastAlertedDueDate = payment.nextDueDate)
                    recurringDao.updateRecurringPayment(updated)
                }
            }

            Result.success()
        } catch (e: Exception) {
            Result.failure()
        }
    }

    private fun showUpcomingNotification(
        paymentId: Long,
        merchant: String,
        amount: Double,
        daysUntilDue: Int
    ) {
        val notificationManager =
            applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Intent to launch MainActivity and open Upcoming Payments screen with paymentId extra
        val intent = Intent(applicationContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_HIGHLIGHT_PAYMENT_ID", paymentId)
            putExtra("EXTRA_NAV_TAB", 2) // Tab index for Recurring Payments
        }

        val pendingIntent = PendingIntent.getActivity(
            applicationContext,
            paymentId.toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val daysText = if (daysUntilDue == 0) "today" else "in $daysUntilDue days"
        val contentText = "$merchant — ₹${String.format("%.2f", amount)} due $daysText."

        val notification = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Upcoming Payment Reminder 🗓️")
            .setContentText(contentText)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(paymentId.toInt(), notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Upcoming Payments Reminders",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Reminders for upcoming subscriptions and recurring bills"
            }
            val notificationManager =
                applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}
