package com.trackify.spenddetection.ai

import com.trackify.spenddetection.data.TransactionEntity
import com.trackify.spenddetection.model.Direction
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AiChatTest {

    @Test
    fun testTransactionSummaryBuilder() {
        val now = System.currentTimeMillis()
        val sampleList = listOf(
            TransactionEntity(
                id = 1,
                sourceApp = "GPay",
                amount = 450.0,
                direction = Direction.DEBIT,
                counterparty = "Zomato",
                rawText = "₹450 paid to Zomato",
                timestamp = now - (2 * 24 * 60 * 60 * 1000L)
            ),
            TransactionEntity(
                id = 2,
                sourceApp = "PhonePe",
                amount = 1200.0,
                direction = Direction.CREDIT,
                counterparty = "Priya Sharma",
                rawText = "Received ₹1200 from Priya",
                timestamp = now - (5 * 24 * 60 * 60 * 1000L)
            ),
            TransactionEntity(
                id = 3,
                sourceApp = "HDFC",
                amount = 749.0,
                direction = Direction.DEBIT,
                counterparty = "AMAZON",
                rawText = "Spent ₹749 at AMAZON",
                timestamp = now - (10 * 24 * 60 * 60 * 1000L)
            )
        )

        val summary = TransactionSummaryBuilder.build30DaySummary(sampleList)

        assertNotNull(summary)
        assertTrue(summary.contains("LAST 30 DAYS FINANCIAL SUMMARY"))
        assertTrue(summary.contains("Total Spent (Debits): ₹1199.00"))
        assertTrue(summary.contains("Total Received (Credits): ₹1200.00"))
        assertTrue(summary.contains("Zomato") || summary.contains("AMAZON"))
    }

    @Test
    fun testFallbackRuleResponderFoodQuery() {
        val now = System.currentTimeMillis()
        val sampleList = listOf(
            TransactionEntity(
                id = 1,
                sourceApp = "GPay",
                amount = 500.0,
                direction = Direction.DEBIT,
                counterparty = "Zomato",
                rawText = "₹500 paid to Zomato for food",
                timestamp = now - (1 * 24 * 60 * 60 * 1000L)
            )
        )

        val answer = FallbackRuleResponder.generateOfflineAnswer("how much did I spend on food?", sampleList)

        assertNotNull(answer)
        assertTrue(answer.contains("Offline Mode"))
        assertTrue(answer.contains("Food & Dining"))
        assertTrue(answer.contains("500.00"))
    }

    @Test
    fun testFallbackRuleResponderHighestExpenseQuery() {
        val now = System.currentTimeMillis()
        val sampleList = listOf(
            TransactionEntity(
                id = 1,
                sourceApp = "GPay",
                amount = 250.0,
                direction = Direction.DEBIT,
                counterparty = "Uber",
                rawText = "₹250 paid to Uber",
                timestamp = now - (1 * 24 * 60 * 60 * 1000L)
            ),
            TransactionEntity(
                id = 2,
                sourceApp = "HDFC",
                amount = 8500.0,
                direction = Direction.DEBIT,
                counterparty = "Zara",
                rawText = "Spent ₹8500 at Zara",
                timestamp = now - (3 * 24 * 60 * 60 * 1000L)
            )
        )

        val answer = FallbackRuleResponder.generateOfflineAnswer("what was my biggest expense?", sampleList)

        assertNotNull(answer)
        assertTrue(answer.contains("Zara"))
        assertTrue(answer.contains("8500.00"))
    }
}
