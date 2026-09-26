package com.trackify.spenddetection.parser

import com.trackify.spenddetection.model.Direction
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class NotificationParserTest {

    @Test
    fun testUpiPaidFormat() {
        val sample = "₹500 paid to Ramesh Kumar via UPI"
        val parsed = NotificationParser.parse(sample, "com.google.android.apps.nbu.paisa.user", 1000L)

        assertNotNull("Failed to parse UPI paid sample", parsed)
        assertEquals(500.0, parsed!!.amount, 0.001)
        assertEquals(Direction.DEBIT, parsed.direction)
        assertEquals("Ramesh Kumar", parsed.counterparty)
        assertEquals("com.google.android.apps.nbu.paisa.user", parsed.sourceApp)
    }

    @Test
    fun testUpiReceivedFormat() {
        val sample = "You received ₹1,200 from Priya Sharma"
        val parsed = NotificationParser.parse(sample, "com.phonepe.app", 2000L)

        assertNotNull("Failed to parse UPI received sample", parsed)
        assertEquals(1200.0, parsed!!.amount, 0.001)
        assertEquals(Direction.CREDIT, parsed.direction)
        assertEquals("Priya Sharma", parsed.counterparty)
        assertEquals("com.phonepe.app", parsed.sourceApp)
    }

    @Test
    fun testCardSpendFormat() {
        val sample = "Spent ₹749.00 on your HDFC Bank Card at AMAZON"
        val parsed = NotificationParser.parse(sample, "com.snapwork.hdfc", 3000L)

        assertNotNull("Failed to parse card spend sample", parsed)
        assertEquals(749.00, parsed!!.amount, 0.001)
        assertEquals(Direction.DEBIT, parsed.direction)
        assertEquals("AMAZON", parsed.counterparty)
        assertEquals("com.snapwork.hdfc", parsed.sourceApp)
    }

    @Test
    fun testPaytmPaidWithRs() {
        val sample = "Rs. 250.50 paid to Swiggy via Paytm Wallet"
        val parsed = NotificationParser.parse(sample, "net.one97.paytm", 4000L)

        assertNotNull(parsed)
        assertEquals(250.50, parsed!!.amount, 0.001)
        assertEquals(Direction.DEBIT, parsed.direction)
        assertEquals("Swiggy", parsed.counterparty)
    }

    @Test
    fun testGenericDebitFormat() {
        val sample = "Debited INR 450.00 for order at Zomato"
        val parsed = NotificationParser.parse(sample, "com.sbi.lotusintouch", 5000L)

        assertNotNull(parsed)
        assertEquals(450.00, parsed!!.amount, 0.001)
        assertEquals(Direction.DEBIT, parsed.direction)
        assertEquals("Zomato", parsed.counterparty)
    }

    @Test
    fun testGenericCreditFormat() {
        val sample = "Credited with ₹ 2500.00 from Account"
        val parsed = NotificationParser.parse(sample, "com.csam.icici.bank.imobile", 6000L)

        assertNotNull(parsed)
        assertEquals(2500.00, parsed!!.amount, 0.001)
        assertEquals(Direction.CREDIT, parsed.direction)
        assertEquals("Account", parsed.counterparty)
    }

    @Test
    fun testUnrecognizedFormatGracefulFailure() {
        val sample = "Your OTP for login is 492019. Do not share with anyone."
        val parsed = NotificationParser.parse(sample, "com.google.android.apps.nbu.paisa.user", 7000L)

        assertNull("OTP message should return null without crashing", parsed)
    }

    @Test
    fun testEmptyOrBlankInput() {
        assertNull(NotificationParser.parse("", "test.app"))
        assertNull(NotificationParser.parse("   ", "test.app"))
    }
}
