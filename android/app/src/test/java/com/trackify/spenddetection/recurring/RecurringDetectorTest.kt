package com.trackify.spenddetection.recurring

import com.trackify.spenddetection.data.Direction
import com.trackify.spenddetection.data.Period
import com.trackify.spenddetection.data.Status
import com.trackify.spenddetection.data.TransactionEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class RecurringDetectorTest {

    private val dayMs = 24 * 60 * 60 * 1000L

    @Test
    fun testCleanMonthlySubscription() {
        val now = System.currentTimeMillis()
        val txns = listOf(
            TransactionEntity(id = 1, sourceApp = "GPay", amount = 649.0, direction = Direction.DEBIT, counterparty = "Netflix", rawText = "Netflix", timestamp = now - (60 * dayMs)),
            TransactionEntity(id = 2, sourceApp = "GPay", amount = 649.0, direction = Direction.DEBIT, counterparty = "Netflix.com", rawText = "Netflix.com", timestamp = now - (30 * dayMs)),
            TransactionEntity(id = 3, sourceApp = "GPay", amount = 649.0, direction = Direction.DEBIT, counterparty = "NETFLIX", rawText = "NETFLIX", timestamp = now)
        )

        val detected = RecurringDetectorEngine.detectRecurringPayments(txns, now)

        assertEquals(1, detected.size)
        val payment = detected.first()
        assertEquals("netflix", payment.normalizedMerchant)
        assertEquals(649.0, payment.amount, 0.001)
        assertEquals(Period.MONTHLY, payment.period)
        assertEquals(Status.ACTIVE, payment.status)
        assertTrue(payment.confidence >= 0.70f)
    }

    @Test
    fun testFreeTrialToPaidTransition() {
        val now = System.currentTimeMillis()
        val txns = listOf(
            TransactionEntity(id = 1, sourceApp = "Paytm", amount = 0.0, direction = Direction.DEBIT, counterparty = "Spotify Trial", rawText = "Trial", timestamp = now - (90 * dayMs)),
            TransactionEntity(id = 2, sourceApp = "Paytm", amount = 119.0, direction = Direction.DEBIT, counterparty = "Spotify", rawText = "Spotify", timestamp = now - (60 * dayMs)),
            TransactionEntity(id = 3, sourceApp = "Paytm", amount = 119.0, direction = Direction.DEBIT, counterparty = "Spotify", rawText = "Spotify", timestamp = now - (30 * dayMs)),
            TransactionEntity(id = 4, sourceApp = "Paytm", amount = 119.0, direction = Direction.DEBIT, counterparty = "Spotify", rawText = "Spotify", timestamp = now)
        )

        val detected = RecurringDetectorEngine.detectRecurringPayments(txns, now)

        assertEquals(1, detected.size)
        val payment = detected.first()
        assertEquals("spotify", payment.normalizedMerchant)
        assertEquals(119.0, payment.amount, 0.001)
        assertEquals(Period.MONTHLY, payment.period)
    }

    @Test
    fun testMissedPaymentFlipsToPossiblyCancelled() {
        val now = System.currentTimeMillis()
        val oldOccurrence = now - (100 * dayMs) // 100 days ago
        val midOccurrence = now - (70 * dayMs)  // 70 days ago (due was 40 days ago, past 34d grace period)

        val txns = listOf(
            TransactionEntity(id = 1, sourceApp = "HDFC", amount = 1500.0, direction = Direction.DEBIT, counterparty = "Cult.fit", rawText = "Gym", timestamp = oldOccurrence),
            TransactionEntity(id = 2, sourceApp = "HDFC", amount = 1500.0, direction = Direction.DEBIT, counterparty = "Cult.fit", rawText = "Gym", timestamp = midOccurrence)
        )

        val detected = RecurringDetectorEngine.detectRecurringPayments(txns, now)

        assertEquals(1, detected.size)
        val payment = detected.first()
        assertEquals(Status.POSSIBLY_CANCELLED, payment.status)
    }

    @Test
    fun testCoincidentalOneOffNotFlagged() {
        val now = System.currentTimeMillis()
        val txns = listOf(
            TransactionEntity(id = 1, sourceApp = "GPay", amount = 450.0, direction = Direction.DEBIT, counterparty = "Zomato", rawText = "Food", timestamp = now - (45 * dayMs)),
            TransactionEntity(id = 2, sourceApp = "GPay", amount = 1200.0, direction = Direction.DEBIT, counterparty = "Zara", rawText = "Clothes", timestamp = now - (12 * dayMs))
        )

        val detected = RecurringDetectorEngine.detectRecurringPayments(txns, now)

        assertTrue("One-off transactions with different merchants/amounts should not be flagged as recurring", detected.isEmpty())
    }
}
