package com.trackify.spenddetection.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.trackify.spenddetection.data.TransactionEntity
import com.trackify.spenddetection.model.Direction
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionFeedScreen(
    transactions: List<TransactionEntity>,
    onUpdateTransaction: (TransactionEntity) -> Unit,
    onDeleteTransaction: (TransactionEntity) -> Unit
) {
    var editingEntity by remember { mutableStateOf<TransactionEntity?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // Header summary card
        val totalDebit = transactions.filter { it.direction == Direction.DEBIT }.sumOf { it.amount }
        val totalCredit = transactions.filter { it.direction == Direction.CREDIT }.sumOf { it.amount }

        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "Total Spent", color = Color(0xFF94A3B8), fontSize = 12.sp)
                    Text(
                        text = "₹${String.format("%.2f", totalDebit)}",
                        color = Color(0xFFEF4444),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Column {
                    Text(text = "Total Received", color = Color(0xFF94A3B8), fontSize = 12.sp)
                    Text(
                        text = "₹${String.format("%.2f", totalCredit)}",
                        color = Color(0xFF10B981),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Column {
                    Text(text = "Captured", color = Color(0xFF94A3B8), fontSize = 12.sp)
                    Text(
                        text = "${transactions.size} alerts",
                        color = Color(0xFF38BDF8),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (transactions.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.ReceiptLong,
                        contentDescription = null,
                        tint = Color(0xFF475569),
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "No Parsed Transactions Yet",
                        color = Color(0xFF94A3B8),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Incoming notifications from GPay, PhonePe, Paytm, and bank apps will appear here automatically.",
                        color = Color(0xFF64748B),
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 16.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(transactions, key = { it.id }) { item ->
                    TransactionItemRow(
                        entity = item,
                        onEditClick = { editingEntity = item },
                        onDeleteClick = { onDeleteTransaction(item) }
                    )
                }
            }
        }
    }

    // Edit Modal Dialog
    editingEntity?.let { entity ->
        EditTransactionDialog(
            entity = entity,
            onDismiss = { editingEntity = null },
            onConfirm = { updated ->
                onUpdateTransaction(updated)
                editingEntity = null
            }
        )
    }
}

@Composable
private fun TransactionItemRow(
    entity: TransactionEntity,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit
) {
    val isDebit = entity.direction == Direction.DEBIT
    val dateFormat = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault())
    val formattedDate = dateFormat.format(Date(entity.timestamp))

    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Direction Icon Badge
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(
                        if (isDebit) Color(0xFFFEF2F2) else Color(0xFFECFDF5),
                        shape = RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isDebit) Icons.Default.ArrowDownward else Icons.Default.ArrowUpward,
                    contentDescription = null,
                    tint = if (isDebit) Color(0xFFEF4444) else Color(0xFF10B981),
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = entity.counterparty ?: entity.sourceApp,
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = Color(0xFF334155),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = entity.sourceApp,
                            color = Color(0xFF94A3B8),
                            fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = formattedDate,
                        color = Color(0xFF64748B),
                        fontSize = 11.sp
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${if (isDebit) "-" else "+"}₹${String.format("%.2f", entity.amount)}",
                    color = if (isDebit) Color(0xFFF87171) else Color(0xFF34D399),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )

                Row {
                    IconButton(
                        onClick = onEditClick,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = Color(0xFF94A3B8),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    IconButton(
                        onClick = onDeleteClick,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = Color(0xFFEF4444),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EditTransactionDialog(
    entity: TransactionEntity,
    onDismiss: () -> Unit,
    onConfirm: (TransactionEntity) -> Unit
) {
    var amountStr by remember { mutableStateOf(entity.amount.toString()) }
    var counterpartyStr by remember { mutableStateOf(entity.counterparty ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = "Edit Transaction", color = Color.White) },
        text = {
            Column {
                OutlinedTextField(
                    value = counterpartyStr,
                    onValueChange = { counterpartyStr = it },
                    label = { Text("Merchant / Counterparty") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFF6366F1),
                        unfocusedBorderColor = Color(0xFF475569)
                    ),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = amountStr,
                    onValueChange = { amountStr = it },
                    label = { Text("Amount (₹)") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFF6366F1),
                        unfocusedBorderColor = Color(0xFF475569)
                    ),
                    singleLine = true
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val newAmount = amountStr.toDoubleOrNull() ?: entity.amount
                    onConfirm(
                        entity.copy(
                            amount = newAmount,
                            counterparty = counterpartyStr.ifBlank { null }
                        )
                    )
                }
            ) {
                Text("Save", color = Color(0xFF6366F1))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = Color(0xFF94A3B8))
            }
        },
        containerColor = Color(0xFF1E293B)
    )
}
