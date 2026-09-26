const express = require("express");
const router = express.Router();

/**
 * POST /api/chat
 * 
 * SECURITY GUARANTEE:
 * This backend route acts as a proxy between the Android client and the Google Gemini API.
 * The GEMINI_API_KEY is read strictly from server-side environment variables and is NEVER
 * exposed or transmitted to the mobile client or embedded in the APK.
 */
router.post("/", async (req, res) => {
  try {
    const { message, transactionSummary, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.status(503).json({
        message: "Gemini API key is not configured on the backend server",
        fallbackRequired: true,
      });
    }

    // System instruction forcing Gemini to ground answers strictly in provided local transaction summary
    const systemInstruction = {
      parts: [
        {
          text:
            "You are Trackify AI, a friendly personal finance assistant. " +
            "Answer user questions ONLY using the transaction summary provided in the user message. " +
            "If the summary does not contain enough information to answer accurately, state clearly that " +
            "you do not have enough transaction data rather than inventing numbers or assuming facts.",
        },
      ],
    };

    // Format prompt content
    const summaryContext = transactionSummary || "No transaction data available for the last 30 days.";
    const userPrompt = `[LOCAL TRANSACTION SUMMARY]\n${summaryContext}\n\n[USER QUESTION]\n${message}`;

    // Format contents array including previous conversation turns if provided
    const contents = [];

    if (Array.isArray(history) && history.length > 0) {
      history.forEach((turn) => {
        if (turn.text) {
          contents.push({
            role: turn.isUser ? "user" : "model",
            parts: [{ text: turn.text }],
          });
        }
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: userPrompt }],
    });

    // Call Google Gemini API (using alias gemini-flash-latest)
    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 sec timeout

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction,
        contents,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", response.status, errorData);
      return res.status(502).json({
        message: `Gemini API service returned error ${response.status}`,
        fallbackRequired: true,
      });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response based on the transaction summary provided.";

    return res.json({ reply, fallbackRequired: false });
  } catch (error) {
    console.error("Chat backend proxy error:", error.message);
    return res.status(500).json({
      message: "Chat proxy service error: " + error.message,
      fallbackRequired: true,
    });
  }
});

module.exports = router;
