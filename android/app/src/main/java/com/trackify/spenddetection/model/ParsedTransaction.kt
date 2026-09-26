package com.trackify.spenddetection.model

/**
 * Direction of financial flow parsed from notification text.
 */
enum class Direction {
    DEBIT,
    CREDIT
}

/**
 * Domain model representing a structured transaction extracted on-device.
 *
 * @property sourceApp Package name or display label of the originating app (e.g. GPay, PhonePe, HDFC)
 * @property amount Numerical transaction value
 * @property direction Debit or Credit classification
 * @property counterparty Merchant or person name (e.g. "Zomato", "Ramesh Kumar")
 * @property rawText Raw notification text (stored on-device only)
 * @property timestamp Epoch timestamp of notification occurrence
 */
data class ParsedTransaction(
    val sourceApp: String,
    val amount: Double,
    val direction: Direction,
    val counterparty: String?,
    val rawText: String,
    val timestamp: Long
)
