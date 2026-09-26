package com.trackify.spenddetection.data

import com.trackify.spenddetection.model.ParsedTransaction
import kotlinx.coroutines.flow.Flow

class TransactionRepository(private val transactionDao: TransactionDao) {

    val allTransactions: Flow<List<TransactionEntity>> = transactionDao.getAllTransactions()

    /**
     * Deduplicates and saves a parsed transaction.
     * If notificationKey already exists (e.g. notification update "Sending..." -> "Sent"),
     * updates the existing record rather than inserting a duplicate.
     */
    suspend fun saveParsedTransaction(
        parsed: ParsedTransaction,
        notificationKey: String?
    ): Boolean {
        if (notificationKey != null) {
            val existing = transactionDao.findByNotificationKey(notificationKey)
            if (existing != null) {
                // Update existing record with final terminal state details
                val updated = existing.copy(
                    amount = parsed.amount,
                    direction = parsed.direction,
                    counterparty = parsed.counterparty ?: existing.counterparty,
                    rawText = parsed.rawText,
                    timestamp = parsed.timestamp
                )
                transactionDao.updateTransaction(updated)
                return false // Updated existing (not a brand new transaction insertion)
            }
        }

        // Insert new transaction
        val entity = TransactionEntity(
            sourceApp = parsed.sourceApp,
            amount = parsed.amount,
            direction = parsed.direction,
            counterparty = parsed.counterparty,
            rawText = parsed.rawText,
            timestamp = parsed.timestamp,
            notificationKey = notificationKey
        )
        transactionDao.insertTransaction(entity)
        return true // Brand new transaction inserted
    }

    suspend fun updateTransaction(entity: TransactionEntity) {
        transactionDao.updateTransaction(entity)
    }

    suspend fun deleteTransaction(entity: TransactionEntity) {
        transactionDao.deleteTransaction(entity)
    }
}
