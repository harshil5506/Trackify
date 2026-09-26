package com.trackify.spenddetection.api

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

data class ChatHistoryItem(
    val text: String,
    val isUser: Boolean
)

data class ChatRequest(
    val message: String,
    val transactionSummary: String,
    val history: List<ChatHistoryItem> = emptyList()
)

data class ChatResponse(
    val reply: String?,
    val message: String?,
    val fallbackRequired: Boolean = false
)

interface ChatApiService {

    @POST("api/chat")
    suspend fun sendChatMessage(@Body request: ChatRequest): Response<ChatResponse>

    companion object {
        // Default local IP for Android Emulator connecting to host machine Express backend
        // Use 10.0.2.2 for Android Emulator, or localhost:5000 / server IP
        private const val BASE_URL = "http://10.0.2.2:5000/"

        fun create(baseUrl: String = BASE_URL): ChatApiService {
            return Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ChatApiService::class.java)
        }
    }
}
