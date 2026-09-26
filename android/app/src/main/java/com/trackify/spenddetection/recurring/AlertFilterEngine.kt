package com.trackify.spenddetection.recurring

import com.trackify.spenddetection.data.RecurringPaymentEntity
import com.trackify.spenddetection.data.Status
import java.util.concurrent.TimeUnit

object AlertFilterEngine {

    private const val DAY_MS = 24 * 60 * 60 * 1000L

    /**
     * Pure function that filters recurring payment records that are due within the alert lead window
     * and have not already been alerted for the current cycle.
     *
     * @param payments List of all recurring payment entities
     * @param defaultLeadDays Global default lead days setting (e.g. 3)
     * @param today Current epoch timestamp
     * @return List of payments that should trigger an upcoming alert
     */
    fun getPaymentsToAlert(
        payments: List<RecurringPaymentEntity>,
        defaultLeadDays: Int = 3,
        today: Long = System.currentTimeMillis()
    ): List<RecurringPaymentEntity> {
        return payments.filter { payment ->
            // 1. Must be ACTIVE (stop alerting if POSSIBLY_CANCELLED)
            if (payment.status != Status.ACTIVE) return@filter false

            // 2. Determine lead days (use per-payment override or global default)
            val leadDays = payment.alertLeadDays

            // 3. Compute remaining days until next due date
            val diffMs = payment.nextDueDate - today
            val daysUntilDue = (diffMs.toDouble() / DAY_MS).toInt()

            // 4. Check if payment is inside lead window (0 <= daysUntilDue <= leadDays)
            val isInsideWindow = daysUntilDue in 0..leadDays

            // 5. Prevent duplicate alerts for the same cycle
            val notAlertedYetForThisCycle = payment.lastAlertedDueDate != payment.nextDueDate

            isInsideWindow && notAlertedYetForThisCycle
        }
    }
}
