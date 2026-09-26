package com.trackify.spenddetection.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface RecurringPaymentDao {

    @Query("SELECT * FROM recurring_payments ORDER BY next_due_date ASC")
    fun getAllRecurringPayments(): Flow<List<RecurringPaymentEntity>>

    @Query("SELECT * FROM recurring_payments WHERE status = 'ACTIVE' ORDER BY next_due_date ASC")
    fun getActiveRecurringPayments(): Flow<List<RecurringPaymentEntity>>

    @Query("SELECT * FROM recurring_payments WHERE status = 'ACTIVE'")
    suspend fun getActiveRecurringPaymentsList(): List<RecurringPaymentEntity>

    @Query("SELECT * FROM recurring_payments WHERE normalized_merchant = :normalizedMerchant LIMIT 1")
    suspend fun findByNormalizedMerchant(normalizedMerchant: String): RecurringPaymentEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertRecurringPayment(payment: RecurringPaymentEntity): Long

    @Update
    suspend fun updateRecurringPayment(payment: RecurringPaymentEntity)

    @Delete
    suspend fun deleteRecurringPayment(payment: RecurringPaymentEntity)

    @Query("UPDATE recurring_payments SET status = :status WHERE id = :id")
    suspend fun updateStatus(id: Long, status: Status)
}
