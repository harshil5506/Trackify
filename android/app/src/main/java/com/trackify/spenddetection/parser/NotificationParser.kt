package com.trackify.spenddetection.parser

import com.trackify.spenddetection.model.Direction
import com.trackify.spenddetection.model.ParsedTransaction
import java.util.regex.Pattern

/**
 * Pure parsing engine for extracting transaction details from notification text.
 *
 * PRIVACY GUARANTEE:
 * Parsing runs strictly on-device. No notification text is transmitted to external servers.
 */
object NotificationParser {

    /**
     * Interface for an individual parsing rule.
     * New bank / app patterns can be added by declaring a new Rule implementation.
     */
    interface Rule {
        fun matchesAndParse(text: String, sourceApp: String, timestamp: Long): ParsedTransaction?
    }

    private const val CURRENCY_PATTERN = "(?:₹|Rs\\.?|INR|\\$)"
    private const val AMOUNT_PATTERN = "([0-9]+(?:\\.[0-9]{1,2})?|[0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]{1,2})?)"

    /**
     * Clean raw amount string (e.g., "1,200.00" -> 1200.0)
     */
    private fun parseAmount(rawAmount: String): Double? {
        return try {
            val cleaned = rawAmount.replace(",", "").trim()
            cleaned.toDouble()
        } catch (e: Exception) {
            null
        }
    }

    // Rule 1: UPI Paid (e.g. "₹500 paid to Ramesh Kumar via UPI")
    private val upiPaidRule = object : Rule {
        private val regex = Pattern.compile(
            "$CURRENCY_PATTERN\\s*$AMOUNT_PATTERN\\s+paid\\s+to\\s+([A-Za-z0-9\\s&.'-]+?)(?:\\s+via|\\s+for|\\s+on|$)",
            Pattern.CASE_INSENSITIVE
        )

        override fun matchesAndParse(text: String, sourceApp: String, timestamp: Long): ParsedTransaction? {
            val matcher = regex.matcher(text)
            if (matcher.find()) {
                val amount = parseAmount(matcher.group(1)) ?: return null
                val counterparty = matcher.group(2)?.trim()
                return ParsedTransaction(
                    sourceApp = sourceApp,
                    amount = amount,
                    direction = Direction.DEBIT,
                    counterparty = counterparty,
                    rawText = text,
                    timestamp = timestamp
                )
            }
            return null
        }
    }

    // Rule 2: UPI Received (e.g. "You received ₹1,200 from Priya Sharma")
    private val upiReceivedRule = object : Rule {
        private val regex = Pattern.compile(
            "(?:received|got)\\s+$CURRENCY_PATTERN\\s*$AMOUNT_PATTERN\\s+from\\s+([A-Za-z0-9\\s&.'-]+?)(?:\\s+via|\\s+in|\\s+for|\\s+on|$)",
            Pattern.CASE_INSENSITIVE
        )

        override fun matchesAndParse(text: String, sourceApp: String, timestamp: Long): ParsedTransaction? {
            val matcher = regex.matcher(text)
            if (matcher.find()) {
                val amount = parseAmount(matcher.group(1)) ?: return null
                val counterparty = matcher.group(2)?.trim()
                return ParsedTransaction(
                    sourceApp = sourceApp,
                    amount = amount,
                    direction = Direction.CREDIT,
                    counterparty = counterparty,
                    rawText = text,
                    timestamp = timestamp
                )
            }
            return null
        }
    }

    // Rule 3: Card Spend Alert (e.g. "Spent ₹749.00 on your HDFC Bank Card at AMAZON")
    private val cardSpendRule = object : Rule {
        private val regex = Pattern.compile(
            "(?:spent|paid|debited)\\s+$CURRENCY_PATTERN\\s*$AMOUNT_PATTERN\\s+.*?at\\s+([A-Za-z0-9\\s&.'-]+?)(?:\\s+on|\\s+via|\\.|\\$|$)",
            Pattern.CASE_INSENSITIVE
        )

        override fun matchesAndParse(text: String, sourceApp: String, timestamp: Long): ParsedTransaction? {
            val matcher = regex.matcher(text)
            if (matcher.find()) {
                val amount = parseAmount(matcher.group(1)) ?: return null
                val counterparty = matcher.group(2)?.trim()
                return ParsedTransaction(
                    sourceApp = sourceApp,
                    amount = amount,
                    direction = Direction.DEBIT,
                    counterparty = counterparty,
                    rawText = text,
                    timestamp = timestamp
                )
            }
            return null
        }
    }

    // Rule 4: Generic Debit (e.g., "Debited ₹ 450.00 for order at Zomato")
    private val genericDebitRule = object : Rule {
        private val regex = Pattern.compile(
            "(?:debited|spent|paid)\\s+(?:by\\s+)?$CURRENCY_PATTERN\\s*$AMOUNT_PATTERN(?:\\s+(?:at|to|for)\\s+([A-Za-z0-9\\s&.'-]+?))?(?:\\.|\\$|$)",
            Pattern.CASE_INSENSITIVE
        )

        override fun matchesAndParse(text: String, sourceApp: String, timestamp: Long): ParsedTransaction? {
            val matcher = regex.matcher(text)
            if (matcher.find()) {
                val amount = parseAmount(matcher.group(1)) ?: return null
                val counterparty = matcher.group(2)?.trim()
                return ParsedTransaction(
                    sourceApp = sourceApp,
                    amount = amount,
                    direction = Direction.DEBIT,
                    counterparty = counterparty,
                    rawText = text,
                    timestamp = timestamp
                )
            }
            return null
        }
    }

    // Rule 5: Generic Credit (e.g., "Credited with ₹ 2500.00 from Account")
    private val genericCreditRule = object : Rule {
        private val regex = Pattern.compile(
            "(?:credited|received)\\s+(?:with\\s+)?$CURRENCY_PATTERN\\s*$AMOUNT_PATTERN(?:\\s+(?:from|by)\\s+([A-Za-z0-9\\s&.'-]+?))?(?:\\.|\\$|$)",
            Pattern.CASE_INSENSITIVE
        )

        override fun matchesAndParse(text: String, sourceApp: String, timestamp: Long): ParsedTransaction? {
            val matcher = regex.matcher(text)
            if (matcher.find()) {
                val amount = parseAmount(matcher.group(1)) ?: return null
                val counterparty = matcher.group(2)?.trim()
                return ParsedTransaction(
                    sourceApp = sourceApp,
                    amount = amount,
                    direction = Direction.CREDIT,
                    counterparty = counterparty,
                    rawText = text,
                    timestamp = timestamp
                )
            }
            return null
        }
    }

    // Registry of all rules
    private val rules: List<Rule> = listOf(
        upiPaidRule,
        upiReceivedRule,
        cardSpendRule,
        genericDebitRule,
        genericCreditRule
    )

    /**
     * Pure function to parse notification text into a ParsedTransaction.
     * Fails gracefully (returns null) on unrecognized text.
     */
    fun parse(text: String, sourceApp: String, timestamp: Long = System.currentTimeMillis()): ParsedTransaction? {
        if (text.isBlank()) return null
        val normalizedText = text.replace("\\s+".toRegex(), " ").trim()

        for (rule in rules) {
            try {
                val result = rule.matchesAndParse(normalizedText, sourceApp, timestamp)
                if (result != null) {
                    return result
                }
            } catch (e: Exception) {
                // Fail gracefully on unexpected pattern mismatch
                continue
            }
        }
        return null
    }
}
