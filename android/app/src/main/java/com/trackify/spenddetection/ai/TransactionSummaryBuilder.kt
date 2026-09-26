package com.trackify.spenddetection.ai

import com.trackify.spenddetection.data.TransactionEntity
import com.trackify.spenddetection.model.Direction
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object TransactionSummaryBuilder {

    /**
     * Builds a compact text summary of relevant transactions from the last 30 days.
     * This string is sent along with the user's prompt to ground Gemini's responses.
     */
    fun build30DaySummary(transactions: List<TransactionEntity>): String {
        val thirtyDaysAgo = System.currentTimeMillis() - (30L * 24 * 60 * 60 * 1000)
        val recentTxns = transactions.filter { it.timestamp >= thirtyDaysAgo }

        if (recentTxns.isEmpty()) {
            return "NO TRANSACTIONS CAPTURED IN THE LAST 30 DAYS."
        }

        val totalDebit = recentTxns.filter { it.direction == Direction.DEBIT }.sumOf { it.amount }
        val totalCredit = recentTxns.filter { it.direction == Direction.CREDIT }.sumOf { it.amount }
        val netBalance = totalCredit - totalDebit

        // Category breakdown for debits
        val categoryBreakdown = recentTxns
            .filter { it.direction == Direction.DEBIT }
            .groupBy { inferCategory(it) }
            .mapValues { entry -> entry.value.sumOf { it.amount } }
            .entries
            .sortedByDescending { it.value }

        // Top 5 largest expenses
        val topExpenses = recentTxns
            .filter { it.direction == Direction.DEBIT }
            .sortedByDescending { it.amount }
            .take(5)

        val dateFormat = SimpleDateFormat("dd MMM", Locale.getDefault())

        val sb = StringBuilder()
        sb.appendLine("=== LAST 30 DAYS FINANCIAL SUMMARY ===")
        sb.appendLine("Total Transactions Recorded: ${recentTxns.size}")
        sb.appendLine("Total Spent (Debits): ₹${String.format("%.2f", totalDebit)}")
        sb.appendLine("Total Received (Credits): ₹${String.format("%.2f", totalCredit)}")
        sb.appendLine("Net Balance Change: ₹${String.format("%.2f", netBalance)}")

        if (categoryBreakdown.isNotEmpty()) {
            sb.appendLine("\n--- SPENDING BY CATEGORY ---")
            categoryBreakdown.forEach { (cat, amount) ->
                val pct = if (totalDebit > 0) (amount / totalDebit * 100).toInt() else 0
                sb.appendLine("- $cat: ₹${String.format("%.2f", amount)} ($pct%)")
            }
        }

        if (topExpenses.isNotEmpty()) {
            sb.appendLine("\n--- TOP 5 LARGEST EXPENSES ---")
            topExpenses.forEachIndexed { index, txn ->
                val dateStr = dateFormat.format(Date(txn.timestamp))
                val target = txn.counterparty ?: txn.sourceApp
                sb.appendLine("${index + 1}. ₹${String.format("%.2f", txn.amount)} at $target ($dateStr)")
            }
        }

        return sb.toString().trim()
    }

    private fun inferCategory(entity: TransactionEntity): String {
        val text = "${entity.counterparty ?: ""} ${entity.rawText}".lowercase(Locale.getDefault())
        return when {
            text.contains("food") || text.contains("zomato") || text.contains("swiggy") || text.contains("restaurant") || text.contains("cafe") || text.contains("dinner") || text.contains("lunch") -> "Food & Dining"
            text.contains("uber") || text.contains("ola") || text.contains("cab") || text.contains("fuel") || text.contains("petrol") || text.contains("auto") -> "Transportation"
            text.contains("amazon") || text.contains("flipkart") || text.contains("zara") || text.contains("shopping") || text.contains("mall") -> "Shopping"
            text.contains("rent") || text.contains("house") -> "Rent"
            text.contains("electricity") || text.contains("wifi") || text.contains("bill") || text.contains("recharge") -> "Bills & Utilities"
            text.contains("movie") || text.contains("netflix") || text.contains("cinema") -> "Entertainment"
            else -> "General / Other"
        }
    }
}
