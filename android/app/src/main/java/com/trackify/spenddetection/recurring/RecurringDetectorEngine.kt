package com.trackify.spenddetection.recurring

import com.trackify.spenddetection.data.Direction
import com.trackify.spenddetection.data.Period
import com.trackify.spenddetection.data.RecurringPaymentEntity
import com.trackify.spenddetection.data.Status
import com.trackify.spenddetection.data.TransactionEntity
import java.util.concurrent.TimeUnit
import kotlin.math.abs

object RecurringDetectorEngine {

    private const val AMOUNT_TOLERANCE = 0.05 // ±5% amount drift tolerance
    private const val DAY_MS = 24 * 60 * 60 * 1000L

    /**
     * Pure function that runs the complete deterministic detection pipeline over transaction history.
     */
    fun detectRecurringPayments(
        transactions: List<TransactionEntity>,
        currentTime: Long = System.currentTimeMillis()
    ): List<RecurringPaymentEntity> {
        // Filter debit transactions with valid positive amounts
        val debits = transactions.filter { it.direction == Direction.DEBIT && it.amount > 0 }
        if (debits.size < 2) return emptyList()

        // Group 1: Group by normalized merchant name
        val merchantGroups = debits.groupBy {
            MerchantNormalizer.normalize(it.counterparty ?: it.sourceApp)
        }

        val results = mutableListOf<RecurringPaymentEntity>()

        for ((normMerchant, groupTxns) in merchantGroups) {
            if (groupTxns.size < 2) continue

            // Sort transactions chronologically
            val sortedTxns = groupTxns.sortedBy { it.timestamp }

            // Group 2: Sub-cluster by amount within ±5% tolerance
            val amountClusters = clusterByAmount(sortedTxns, AMOUNT_TOLERANCE)

            for (cluster in amountClusters) {
                // Free trial / paid transition check: filter out ₹0 or trivial trial amounts
                val validTxns = cluster.filter { it.amount > 0 }
                if (validTxns.size < 2) continue

                // Group 3: Analyze interval regularity between consecutive occurrences
                val intervalAnalysis = analyzeIntervals(validTxns) ?: continue

                val (period, typicalIntervalMs, confidence) = intervalAnalysis

                val lastTxn = validTxns.last()
                val displayMerchant = lastTxn.counterparty ?: lastTxn.sourceApp
                val avgAmount = validTxns.map { it.amount }.average()

                val nextDueDate = lastTxn.timestamp + typicalIntervalMs

                // Missed payment / cancellation check:
                // Grace period = typical interval + 4 days
                val gracePeriodMs = typicalIntervalMs + (4 * DAY_MS)
                val status = if (currentTime > (nextDueDate + gracePeriodMs)) {
                    Status.POSSIBLY_CANCELLED
                } else {
                    Status.ACTIVE
                }

                results.add(
                    RecurringPaymentEntity(
                        normalizedMerchant = normMerchant,
                        displayMerchant = displayMerchant,
                        amount = Math.round(avgAmount * 100.0) / 100.0,
                        period = period,
                        lastOccurrence = lastTxn.timestamp,
                        nextDueDate = nextDueDate,
                        occurrenceCount = validTxns.size,
                        confidence = confidence,
                        status = status
                    )
                )
            }
        }

        return results
    }

    /**
     * Sub-clusters transactions where amounts are within ±5% tolerance of each other.
     */
    private fun clusterByAmount(
        txns: List<TransactionEntity>,
        toleranceRatio: Double
    ): List<List<TransactionEntity>> {
        val clusters = mutableListOf<MutableList<TransactionEntity>>()

        for (txn in txns) {
            var addedToCluster = false
            for (cluster in clusters) {
                val clusterAvg = cluster.map { it.amount }.average()
                if (abs(txn.amount - clusterAvg) / clusterAvg <= toleranceRatio) {
                    cluster.add(txn)
                    addedToCluster = true
                    break
                }
            }
            if (!addedToCluster) {
                clusters.add(mutableListOf(txn))
            }
        }

        return clusters
    }

    private data class IntervalAnalysis(
        val period: Period,
        val intervalMs: Long,
        val confidence: Float
    )

    /**
     * Computes consecutive gaps in days and classifies into WEEKLY, MONTHLY, QUARTERLY, or YEARLY.
     */
    private fun analyzeIntervals(txns: List<TransactionEntity>): IntervalAnalysis? {
        if (txns.size < 2) return null

        val gapsInDays = mutableListOf<Double>()
        for (i in 0 until txns.size - 1) {
            val gapMs = txns[i + 1].timestamp - txns[i].timestamp
            val gapDays = gapMs.toDouble() / DAY_MS
            gapsInDays.add(gapDays)
        }

        val avgGapDays = gapsInDays.average()

        // Classify period based on average gap in days
        val (period, targetDays, allowedVariance) = when {
            avgGapDays in 5.0..9.0 -> Triple(Period.WEEKLY, 7.0, 2.5)
            avgGapDays in 24.0..35.0 -> Triple(Period.MONTHLY, 30.0, 4.0)
            avgGapDays in 80.0..100.0 -> Triple(Period.QUARTERLY, 90.0, 7.0)
            avgGapDays in 350.0..380.0 -> Triple(Period.YEARLY, 365.0, 15.0)
            else -> return null
        }

        // Check variance relative to target days
        val maxDev = gapsInDays.maxOf { abs(it - targetDays) }
        if (maxDev > allowedVariance) {
            // High variance -> not a regular interval
            return null
        }

        val intervalMs = (targetDays * DAY_MS).toLong()

        // Calculate confidence score (0.0 to 1.0) based on occurrence count and consistency
        val countFactor = (txns.size.toFloat() / 5.0f).coerceAtMost(1.0f)
        val varianceFactor = (1.0f - (maxDev / targetDays).toFloat()).coerceAtLeast(0.5f)
        val confidence = ((countFactor * 0.6f) + (varianceFactor * 0.4f)).coerceIn(0.5f, 1.0f)

        return IntervalAnalysis(period, intervalMs, confidence)
    }
}
