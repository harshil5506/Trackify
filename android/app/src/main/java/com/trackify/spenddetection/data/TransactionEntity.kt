package com.trackify.spenddetection.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.trackify.spenddetection.model.Direction

/**
 * Room Entity representing parsed transaction records.
 *
 * PRIVACY GUARANTEE:
 * The `raw_text` field is stored strictly on-device in local SQLite storage for
 * local debugging and re-parsing. It is never logged or transmitted off-device.
 */
@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,

    @ColumnInfo(name = "source_app")
    val sourceApp: String,

    @ColumnInfo(name = "amount")
    val amount: Double,

    @ColumnInfo(name = "direction")
    val direction: Direction,

    @ColumnInfo(name = "counterparty")
    val counterparty: String?,

    @ColumnInfo(name = "raw_text")
    val rawText: String,

    @ColumnInfo(name = "timestamp")
    val timestamp: Long,

    @ColumnInfo(name = "notification_key")
    val notificationKey: String? = null
)
