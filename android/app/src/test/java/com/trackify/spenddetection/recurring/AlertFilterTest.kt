package com.trackify.spenddetection.recurring

import com.trackify.spenddetection.data.Period
import com.trackify.spenddetection.data.RecurringPaymentEntity
import com.trackify.spenddetection.data.Status
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AlertFilterTest {

    private val dayMs = 24 * 60 * 60 * 1000L

    @Test
    fun testPaymentInsideWindowShouldAlert() {
        val today = System.currentTimeMillis()
        val nextDue = today + (2 * dayMs) // Due in 2 days

        val payment = RecurringPaymentEntity(
            id = 1,
            normalizedMerchant = "netflix",
            displayMerchant = "Netflix",
            amount = 649.0,
            period = Period.MONTHLY,
            lastOccurrence = today - (28 * dayMs),
            nextDueDate = nextDue,
            occurrenceCount = 3,
            confidence = 0.9f,
            status = Status.ACTIVE,
            alertLeadDays = 3,
            lastAlertedDueDate = null
        )

        val toAlert = AlertFilterEngine.getPaymentsToAlert(listOf(payment), defaultLeadDays = 3, today = today)

        assertEquals(1, toAlert.size)
        assertEquals("netflix", toAlert.first().normalizedMerchant)
    }

    @Test
    fun testPaymentAlreadyAlertedForCurrentCycleShouldNotAlert() {
        val today = System.currentTimeMillis()
        val nextDue = today + (2 * dayMs) // Due in 2 days

        val payment = RecurringPaymentEntity(
            id = 1,
            normalizedMerchant = "netflix",
            displayMerchant = "Netflix",
            amount = 649.0,
            period = Period.MONTHLY,
            lastOccurrence = today - (28 * dayMs),
            nextDueDate = nextDue,
            occurrenceCount = 3,
            confidence = 0.9f,
            status = Status.ACTIVE,
            alertLeadDays = 3,
            lastAlertedDueDate = nextDue // Already alerted for this exact cycle!
        )

        val toAlert = AlertFilterEngine.getPaymentsToAlert(listOf(payment), defaultLeadDays = 3, today = today)

        assertTrue("Already alerted payment for this cycle should not re-alert", toAlert.isEmpty())
    }

    @Test
    fun testPaymentOutsideWindowShouldNotAlert() {
        val today = System.currentTimeMillis()
        val nextDue = today + (10 * dayMs) // Due in 10 days

        val payment = RecurringPaymentEntity(
            id = 1,
            normalizedMerchant = "spotify",
            displayMerchant = "Spotify",
            amount = 119.0,
            period = Period.MONTHLY,
            lastOccurrence = today - (20 * dayMs),
            nextDueDate = nextDue,
            occurrenceCount = 3,
            confidence = 0.85f,
            status = Status.ACTIVE,
            alertLeadDays = 3,
            lastAlertedDueDate = null
        )

        val toAlert = AlertFilterEngine.getPaymentsToAlert(listOf(payment), defaultLeadDays = 3, today = today)

        assertTrue("Payment due in 10 days with 3-day lead should not alert", toAlert.isEmpty())
    }

    @Test
    fun testPossiblyCancelledPaymentInsideWindowShouldNotAlert() {
        val today = System.currentTimeMillis()
        val nextDue = today + (1 * dayMs) // Due in 1 day

        val payment = RecurringPaymentEntity(
            id = 1,
            normalizedMerchant = "gym",
            displayMerchant = "Cult.fit",
            amount = 1500.0,
            period = Period.MONTHLY,
            lastOccurrence = today - (60 * dayMs),
            nextDueDate = nextDue,
            occurrenceCount = 3,
            confidence = 0.8f,
            status = Status.POSSIBLY_CANCELLED, // Missed / Possibly Cancelled
            alertLeadDays = 3,
            lastAlertedDueDate = null
        )

        val toAlert = AlertFilterEngine.getPaymentsToAlert(listOf(payment), defaultLeadDays = 3, today = today)

        assertTrue("POSSIBLY_CANCELLED payments should stop alerting", toAlert.isEmpty())
    }
}
