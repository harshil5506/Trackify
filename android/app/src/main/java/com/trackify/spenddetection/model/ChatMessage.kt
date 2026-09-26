package com.trackify.spenddetection.model

import java.util.UUID

/**
 * Represents a single message bubble in the AI Chatbot conversation.
 *
 * @property id Unique identifier for UI list keying
 * @property text Message body
 * @property isUser True if sent by the user, false if response from Gemini/Fallback assistant
 * @property timestamp Epoch timestamp when sent/received
 * @property isFallback True if generated via local on-device rule responder fallback (e.g. when offline)
 */
data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    val isFallback: Boolean = false
)
