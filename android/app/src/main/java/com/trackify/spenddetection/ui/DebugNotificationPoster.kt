package com.trackify.spenddetection.ui

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationCompat
import com.trackify.spenddetection.R

@Composable
fun DebugNotificationPoster() {
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
    ) {
        Text(
            text = "Developer Test Panel",
            color = Color.White,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Post synthetic notifications to exercise the listener end-to-end on Android Emulator without real bank apps.",
            color = Color(0xFF94A3B8),
            fontSize = 13.sp
        )

        Spacer(modifier = Modifier.height(20.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {

                // Test Button 1: GPay Paid
                TestButton(
                    title = "Post GPay Spend Alert (₹500)",
                    subtitle = "₹500 paid to Ramesh Kumar via UPI",
                    buttonColor = Color(0xFF6366F1),
                    onClick = {
                        postSyntheticNotification(
                            context = context,
                            id = 1001,
                            title = "Google Pay",
                            text = "₹500 paid to Ramesh Kumar via UPI"
                        )
                    }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Test Button 2: PhonePe Credit
                TestButton(
                    title = "Post PhonePe Income Alert (₹1,200)",
                    subtitle = "You received ₹1,200 from Priya Sharma",
                    buttonColor = Color(0xFF10B981),
                    onClick = {
                        postSyntheticNotification(
                            context = context,
                            id = 1002,
                            title = "PhonePe",
                            text = "You received ₹1,200 from Priya Sharma"
                        )
                    }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Test Button 3: HDFC Card
                TestButton(
                    title = "Post HDFC Card Alert (₹749.00)",
                    subtitle = "Spent ₹749.00 on your HDFC Bank Card at AMAZON",
                    buttonColor = Color(0xFFF59E0B),
                    onClick = {
                        postSyntheticNotification(
                            context = context,
                            id = 1003,
                            title = "HDFC Bank Alert",
                            text = "Spent ₹749.00 on your HDFC Bank Card at AMAZON"
                        )
                    }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Test Button 4: Zomato Debit
                TestButton(
                    title = "Post Generic Debit Alert (₹450.00)",
                    subtitle = "Debited INR 450.00 for order at Zomato",
                    buttonColor = Color(0xFFEC4899),
                    onClick = {
                        postSyntheticNotification(
                            context = context,
                            id = 1004,
                            title = "Bank Alert",
                            text = "Debited INR 450.00 for order at Zomato"
                        )
                    }
                )
            }
        }
    }
}

@Composable
private fun TestButton(
    title: String,
    subtitle: String,
    buttonColor: Color,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = buttonColor)
    ) {
        Column {
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = Color.White.copy(alpha = 0.8f)
            )
        }
    }
}

private fun postSyntheticNotification(
    context: Context,
    id: Int,
    title: String,
    text: String
) {
    val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    val channelId = "debug_synthetic_channel"
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channel = NotificationChannel(
            channelId,
            "Debug Test Notifications",
            NotificationManager.IMPORTANCE_DEFAULT
        )
        notificationManager.createNotificationChannel(channel)
    }

    val notification = NotificationCompat.Builder(context, channelId)
        .setSmallIcon(R.mipmap.ic_launcher)
        .setContentTitle(title)
        .setContentText(text)
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .setAutoCancel(true)
        .build()

    notificationManager.notify(id, notification)
}
