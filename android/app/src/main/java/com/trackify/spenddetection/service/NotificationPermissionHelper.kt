package com.trackify.spenddetection.service

import android.content.Context
import android.content.Intent
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat

object NotificationPermissionHelper {

    /**
     * Checks whether Notification Access permission is currently granted to this app.
     */
    fun isNotificationAccessGranted(context: Context): Boolean {
        val packageName = context.packageName
        val enabledPackages = NotificationManagerCompat.getEnabledListenerPackages(context)
        return enabledPackages.contains(packageName)
    }

    /**
     * Returns an Intent that deep-links directly to Android Settings -> Notification Access.
     */
    fun getNotificationAccessSettingsIntent(): Intent {
        return Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }
}
