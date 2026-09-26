package com.trackify.spenddetection.repository

import com.trackify.spenddetection.ai.FallbackRuleResponder
import com.trackify.spenddetection.ai.TransactionSummaryBuilder
import com.trackify.spenddetection.api.ChatApiService
import com.trackify.spenddetection.api.ChatHistoryItem
import com.trackify.spenddetection.api.ChatRequest
import com.trackify.spenddetection.data.TransactionEntity
import com.trackify.spenddetection.model.ChatMessage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ChatRepository(
    private val chatApiService: ChatApiService = ChatApiService.create()
) {

    /**
     * Sends a user query to the AI Assistant.
     *
     * SECURITY & PRIVACY GUARANTEE:
     * - All queries go through our secure Express backend proxy (`/api/chat`).
     * - The GEMINI_API_KEY resides ONLY on the backend server and is NEVER embedded in the APK.
     * - If network or backend is unreachable, falls back seamlessly to on-device FallbackRuleResponder.
     */
    suspend fun sendMessage(
        userMessage: String,
        conversationHistory: List<ChatMessage>,
        localTransactions: List<TransactionEntity>
    ): ChatMessage = withContext(Dispatchers.IO) {

        // 1. Build compact 30-day transaction summary from local Room DB
        val summary = TransactionSummaryBuilder.build30DaySummary(localTransactions)

        // Format history items for API context
        val historyItems = conversationHistory.takeLast(6).map { msg ->
            ChatHistoryItem(text = msg.text, isUser = msg.isUser)
        }

        try {
            // 2. Call backend proxy endpoint
            val response = chatApiService.sendChatMessage(
                ChatRequest(
                    message = userMessage,
                    transactionSummary = summary,
                    history = historyItems
                )
            )

            if (response.isSuccessful) {
                val body = response.body()
                val replyText = body?.reply
                if (!replyText.isNull_or_blank() && !body!!.fallbackRequired) {
                    return@withContext ChatMessage(
                        text = replyText.trim(),
                        isUser = false,
                        isFallback = false
                    )
                }
            }

            // 3. Backend reported error or fallback required -> Use on-device rule responder
            val fallbackReply = FallbackRuleResponder.generateOfflineAnswer(userMessage, localTransactions)
            return@withContext ChatMessage(
                text = fallbackReply,
                isUser = false,
                isFallback = true
            )
        } catch (e: Exception) {
            // Network connection error / offline -> Use on-device rule responder
            val fallbackReply = FallbackRuleResponder.generateOfflineAnswer(userMessage, localTransactions)
            return@withContext ChatMessage(
                text = fallbackReply,
                isUser = false,
                isFallback = true
            )
        }
    }
}

// String extension helper for null or blank
private fun String?.isNull_or_blank(): Boolean {
    return this == null || this.trim().isEmpty()
}
