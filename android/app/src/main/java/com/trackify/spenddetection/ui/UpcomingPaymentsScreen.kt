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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoRenew
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.EventRepeat
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
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
import com.trackify.spenddetection.data.Period
import com.trackify.spenddetection.data.RecurringPaymentEntity
import com.trackify.spenddetection.data.Status
import com.trackify.spenddetection.data.TransactionEntity
import com.trackify.spenddetection.recurring.MerchantNormalizer
import com.trackify.spenddetection.recurring.RecurringDetectorEngine
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UpcomingPaymentsScreen(
    recurringPayments: List<RecurringPaymentEntity>,
    localTransactions: List<TransactionEntity>,
    onSaveRecurringPayment: (RecurringPaymentEntity) -> Unit,
    onDeleteRecurringPayment: (RecurringPaymentEntity) -> Unit,
    onUpdateStatus: (Long, Status) -> Unit
) {
    var showAddModal by remember { mutableStateOf(false) }

    val activeList = recurringPayments.filter { it.status == Status.ACTIVE }.sortedBy { it.nextDueDate }
    val cancelledList = recurringPayments.filter { it.status == Status.POSSIBLY_CANCELLED }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header with Detection Trigger Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Upcoming Payments",
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Subscriptions & recurring bills detected on-device",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }

                Button(
                    onClick = {
                        val detected = RecurringDetectorEngine.detectRecurringPayments(localTransactions)
                        detected.forEach { onSaveRecurringPayment(it) }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoRenew,
                        contentDescription = "Re-detect",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Scan", fontSize = 12.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (activeList.isEmpty() && cancelledList.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.EventRepeat,
                            contentDescription = null,
                            tint = Color(0xFF475569),
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No Recurring Payments Detected",
                            color = Color(0xFF94A3B8),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Tap 'Scan' to analyze your captured transaction history or tap '+' to manually add a recurring bill.",
                            color = Color(0xFF64748B),
                            fontSize = 13.sp,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    // Active Recurring Payments Section
                    if (activeList.isNotEmpty()) {
                        item {
                            Text(
                                text = "ACTIVE SUBSCRIPTIONS & BILLS (${activeList.size})",
                                color = Color(0xFF38BDF8),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        }

                        items(activeList, key = { it.id }) { payment ->
                            RecurringPaymentCard(
                                payment = payment,
                                onDeleteClick = { onDeleteRecurringPayment(payment) },
                                onMarkNotRecurring = { onDeleteRecurringPayment(payment) }
                            )
                        }
                    }

                    // Possibly Cancelled / Missed Section
                    if (cancelledList.isNotEmpty()) {
                        item {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "POSSIBLY CANCELLED / MISSED (${cancelledList.size})",
                                color = Color(0xFFF59E0B),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        }

                        items(cancelledList, key = { it.id }) { payment ->
                            CancelledPaymentCard(
                                payment = payment,
                                onReactivate = { onUpdateStatus(payment.id, Status.ACTIVE) },
                                onDismiss = { onDeleteRecurringPayment(payment) }
                            )
                        }
                    }
                }
            }
        }

        // Add Manual Override FAB
        FloatingActionButton(
            onClick = { showAddModal = true },
            containerColor = Color(0xFF10B981),
            contentColor = Color.White,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp)
        ) {
            Icon(imageVector = Icons.Default.Add, contentDescription = "Add Manual")
        }

        // Manual Add Dialog
        if (showAddModal) {
            AddManualRecurringDialog(
                onDismiss = { showAddModal = false },
                onConfirm = { newPayment ->
                    onSaveRecurringPayment(newPayment)
                    showAddModal = false
                }
            )
        }
    }
}

@Composable
private fun RecurringPaymentCard(
    payment: RecurringPaymentEntity,
    onDeleteClick: () -> Unit,
    onMarkNotRecurring: () -> Unit
) {
    val today = System.currentTimeMillis()
    val diffMs = payment.nextDueDate - today
    val daysLeft = (diffMs.toDouble() / (24 * 60 * 60 * 1000L)).toInt()
    val dateFormat = SimpleDateFormat("dd MMM, yyyy", Locale.getDefault())
    val dueDateStr = dateFormat.format(Date(payment.nextDueDate))

    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = payment.displayMerchant,
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            color = Color(0xFF334155),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = payment.period.name,
                                color = Color(0xFF38BDF8),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Due: $dueDateStr",
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp
                        )
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "₹${String.format("%.2f", payment.amount)}",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = when {
                            daysLeft < 0 -> "Overdue"
                            daysLeft == 0 -> "Due Today"
                            daysLeft == 1 -> "Due Tomorrow"
                            else -> "In $daysLeft days"
                        },
                        color = if (daysLeft <= 3) Color(0xFFEF4444) else Color(0xFF10B981),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = onMarkNotRecurring) {
                    Icon(
                        imageVector = Icons.Default.Block,
                        contentDescription = null,
                        tint = Color(0xFF94A3B8),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Not Recurring", color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
                IconButton(onClick = onDeleteClick, modifier = Modifier.size(28.dp)) {
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

@Composable
private fun CancelledPaymentCard(
    payment: RecurringPaymentEntity,
    onReactivate: () -> Unit,
    onDismiss: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF291E1E)),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = Color(0xFFF59E0B),
                modifier = Modifier.size(24.dp)
            )

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = payment.displayMerchant,
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Missed due date — possibly cancelled?",
                    color = Color(0xFFFCA5A5),
                    fontSize = 11.sp
                )
            }

            Row {
                IconButton(onClick = onReactivate, modifier = Modifier.size(32.dp)) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Still Active",
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(20.dp)
                    )
                }
                IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Dismiss",
                        tint = Color(0xFFEF4444),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun AddManualRecurringDialog(
    onDismiss: () -> Unit,
    onConfirm: (RecurringPaymentEntity) -> Unit
) {
    var merchantStr by remember { mutableStateOf("") }
    var amountStr by remember { mutableStateOf("") }
    var periodSelected by remember { mutableStateOf(Period.MONTHLY) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = "Add Recurring Bill", color = Color.White) },
        text = {
            Column {
                OutlinedTextField(
                    value = merchantStr,
                    onValueChange = { merchantStr = it },
                    label = { Text("Merchant / Bill Name") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFF6366F1),
                        unfocusedBorderColor = Color(0xFF475569)
                    ),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))
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
                    val amount = amountStr.toDoubleOrNull() ?: 0.0
                    if (merchantStr.isNotBlank() && amount > 0) {
                        val now = System.currentTimeMillis()
                        val nextDue = now + (30L * 24 * 60 * 60 * 1000L)
                        onConfirm(
                            RecurringPaymentEntity(
                                normalizedMerchant = MerchantNormalizer.normalize(merchantStr),
                                displayMerchant = merchantStr.trim(),
                                amount = amount,
                                period = periodSelected,
                                lastOccurrence = now,
                                nextDueDate = nextDue,
                                occurrenceCount = 1,
                                confidence = 1.0f,
                                status = Status.ACTIVE,
                                isManualOverride = true
                            )
                        )
                    }
                }
            ) {
                Text("Add", color = Color(0xFF10B981))
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
