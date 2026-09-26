package com.trackify.spenddetection.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

enum class Period {
    WEEKLY,
    MONTHLY,
    QUARTERLY,
    YEARLY
}

enum class Status {
    ACTIVE,
    POSSIBLY_CANCELLED
}

/**
 * Room Entity representing a detected or manually added recurring payment / subscription.
 */
@Entity(tableName = "recurring_payments")
data class RecurringPaymentEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "normalized_merchant")
    val normalizedMerchant: String,

    @ColumnInfo(name = "display_merchant")
    val displayMerchant: String,

    @ColumnInfo(name = "amount")
    val amount: Double,

    @ColumnInfo(name = "period")
    val period: Period,

    @ColumnInfo(name = "last_occurrence")
    val lastOccurrence: Long,

    @ColumnInfo(name = "next_due_date")
    val nextDueDate: Long,

    @ColumnInfo(name = "occurrence_count")
    val occurrenceCount: Int,

    @ColumnInfo(name = "confidence")
    val confidence: Float,

    @ColumnInfo(name = "status")
    val status: Status = Status.ACTIVE,

    @ColumnInfo(name = "alert_lead_days")
    val alertLeadDays: Int = 3,

    @ColumnInfo(name = "last_alerted_due_date")
    val lastAlertedDueDate: Long? = null,

    @ColumnInfo(name = "is_manual_override")
    val isManualOverride: Boolean = false
)
