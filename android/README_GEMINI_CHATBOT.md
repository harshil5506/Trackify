# Trackify AI Chatbot (Google Gemini API + Grounded Android Client)

This feature integrates a natural-language AI Assistant into Trackify grounded in the user's local 30-day Room transaction data.

---

## 🔒 NON-NEGOTIABLE SECURITY ARCHITECTURE

```
[Android App] ---> (POST /api/chat) ---> [Express Backend Proxy] ---> [Google Gemini API]
```

> [!CAUTION]
> **NEVER EMBED THE GEMINI API KEY IN THE ANDROID APP OR COMMIT IT TO REPOSITORIES!**
> Android APK files can easily be decompiled, allowing embedded API keys to be extracted by unauthorized third parties.
> The `GEMINI_API_KEY` resides **strictly** as a server-side environment variable in `server/.env`. All AI queries pass through our Express backend proxy route (`POST /api/chat`).

---

## ⚙️ Backend Proxy Setup (`server/`)

### 1. Configure the Gemini API Key
Obtain an API Key from [Google AI Studio](https://aistudio.google.com/) and add it to your server environment file (`server/.env`):

```env
GEMINI_API_KEY=AIzaSy...your_actual_gemini_api_key...
```

### 2. Start the Backend Proxy Server
```bash
cd server
npm start
```
The server will start on port `5000` with the `/api/chat` route active.

---

## 🤖 Model & Request Specifications

- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`
- **Auth Header**: `x-goog-api-key: $GEMINI_API_KEY`
- **Model Alias**: `gemini-flash-latest` (automatically tracks Google's current default Flash model).
- **System Instruction**:
  ```
  You are Trackify AI, a friendly personal finance assistant.
  Answer user questions ONLY using the transaction summary provided in the user message.
  If the summary does not contain enough information to answer accurately, state clearly that you do not have enough transaction data rather than inventing numbers or assuming facts.
  ```

---

## 📱 Android Client Grounding & Offline Fallback

1. **Context Grounding (`TransactionSummaryBuilder.kt`)**:
   Before dispatching a user prompt, the Android app queries the local Room SQLite database for records over the last 30 days and constructs a compact financial summary (total spend, total credits, category breakdown, top 5 largest items).

2. **Offline & Network Fallback (`FallbackRuleResponder.kt`)**:
   If the user is offline, the backend proxy is unreachable, or the API key is not configured, the app seamlessly falls back to an on-device rule-based template engine. Answers are computed directly from local Room DB records without throwing network error screens or dead ends.

---

## 🧪 Testing the Chatbot

1. Launch the Express server (`npm start` in `server/`).
2. Launch the Android Spend Detection app on an Android emulator or device.
3. Tap the **AI Chat** tab at the bottom navigation bar.
4. Try sample questions or tap the quick prompt chips:
   - *"How much did I spend on food this month?"*
   - *"What was my highest expense?"*
   - *"Show total spend this month"*
5. **Test Offline Fallback**: Turn off Wi-Fi or stop the Express backend. Ask a question — the chatbot will render the answer using the local rule engine labeled with an **Offline Mode • Local Engine** badge.
