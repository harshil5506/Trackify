package com.trackify.spenddetection.recurring

import java.util.Locale

object MerchantNormalizer {

    /**
     * Pure function to normalize merchant names.
     * Lowercases, strips domain extensions (.com, .in), removes reference IDs/order numbers,
     * strips special characters, and collapses whitespace.
     *
     * Example: "NETFLIX.COM", "Netflix*Subscription", "NETFLIX" -> "netflix"
     */
    fun normalize(rawMerchant: String?): String {
        if (rawMerchant.isNullOrBlank()) return "unknown"

        var cleaned = rawMerchant.lowercase(Locale.getDefault())

        // 1. Remove domain suffixes (.com, .in, .org, .net, .co.in)
        cleaned = cleaned.replace("\\.(com|in|org|net|co\\.in)\\b".toRegex(), "")

        // 2. Remove common prefixes/suffixes like *subscription, *billing, #12345, order-902
        cleaned = cleaned.replace("[*#]\\s*\\w+".toRegex(), "")
        cleaned = cleaned.replace("\\b(subscription|billing|payment|order|ref|txn|id)\\b".toRegex(), "")

        // 3. Replace non-alphanumeric characters with spaces
        cleaned = cleaned.replace("[^a-z0-9\\s]".toRegex(), " ")

        // 4. Strip trailing numeric IDs (e.g. "zomato 92019" -> "zomato")
        cleaned = cleaned.replace("\\b\\d{4,}\\b".toRegex(), "")

        // 5. Collapse whitespace and trim
        cleaned = cleaned.replace("\\s+".toRegex(), " ").trim()

        return if (cleaned.isBlank()) rawMerchant.lowercase().trim() else cleaned
    }
}
