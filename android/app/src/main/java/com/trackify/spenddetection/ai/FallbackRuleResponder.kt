package com.trackify.spenddetection.ai

import com.trackify.spenddetection.data.TransactionEntity
import com.trackify.spenddetection.model.Direction
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object FallbackRuleResponder {

    /**
     * Offline rule-based responder that computes structured answers directly from local
     * Room DB records when network/proxy is unavailable or fails.
     */
    fun generateOfflineAnswer(userQuery: String, transactions: List<TransactionEntity>): String {
        val query = userQuery.lowercase(Locale.getDefault())

        if (transactions.isEmpty()) {
            return "📱 [Offline Mode] No transactions have been captured in your local database yet. Incoming notifications will appear here automatically."
        }

        val thirtyDaysAgo = System.currentTimeMillis() - (30L * 24 * 60 * 60 * 1000)
        val recentTxns = transactions.filter { it.timestamp >= thirtyDaysAgo }
        val debits = recentTxns.filter { it.direction == Direction.DEBIT }
        val credits = recentTxns.filter { it.direction == Direction.CREDIT }

        return when {
            query.contains("biggest") || query.contains("highest") || query.contains("largest") || query.contains("max") -> {
                val maxExpense = debits.maxByOrNull { it.amount }
                if (maxExpense != null) {
                    val target = maxExpense.counterparty ?: maxExpense.sourceApp
                    val dateStr = SimpleDateFormat("dd MMM", Locale.getDefault()).format(Date(maxExpense.timestamp))
                    "📱 [Offline Mode] Your biggest expense in the last 30 days was ₹${String.format("%.2f", maxExpense.amount)} at $target on $dateStr."
                } else {
                    "📱 [Offline Mode] No debit expenses recorded in the last 30 days."
                }
            }
            query.contains("food") || query.contains("dining") || query.contains("zomato") || query.contains("swiggy") || query.contains("eat") -> {
                val foodTotal = debits.filter {
                    val text = "${it.counterparty} ${it.rawText}".lowercase()
                    text.contains("food") || text.contains("zomato") || text.contains("swiggy") || text.contains("dining") || text.contains("restaurant")
                }.sumOf { it.amount }
                "📱 [Offline Mode] You spent ₹${String.format("%.2f", foodTotal)} on Food & Dining in the last 30 days."
            }
            query.contains("transport") || query.contains("cab") || query.contains("uber") || query.contains("ola") || query.contains("fuel") -> {
                val transportTotal = debits.filter {
                    val text = "${it.counterparty} ${it.rawText}".lowercase()
                    text.contains("uber") || text.contains("ola") || text.contains("cab") || text.contains("fuel") || text.contains("petrol")
                }.sumOf { it.amount }
                "📱 [Offline Mode] You spent ₹${String.format("%.2f", transportTotal)} on Transportation & Cabs in the last 30 days."
            }
            query.contains("total") || query.contains("spend") || query.contains("spent") || query.contains("how much") -> {
                val totalDebit = debits.sumOf { it.amount }
                val totalCredit = credits.sumOf { it.amount }
                "📱 [Offline Mode] Over the last 30 days, your total spend is ₹${String.format("%.2f", totalDebit)} across ${debits.size} debit transactions (Total received: ₹${String.format("%.2f", totalCredit)})."
            }
            else -> {
                val totalDebit = debits.sumOf { it.amount }
                val count = recentTxns.size
                "📱 [Offline Mode] You have $count transactions in the last 30 days totaling ₹${String.format("%.2f", totalDebit)} in expenses. (Connect to network for detailed AI conversation)."
            }
        }
    }
}
