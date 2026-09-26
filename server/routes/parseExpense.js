const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Map of number words to numeric values
const NUMBER_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000,
};

const CATEGORY_MAP = [
  { category: "Food", keywords: ["food", "groceries", "grocery", "lunch", "dinner", "breakfast", "snack", "snacks", "pizza", "burger", "coffee", "starbucks", "restaurant", "cafe", "zomato", "swiggy", "milk", "bread", "eating out"] },
  { category: "Transportation", keywords: ["cab", "uber", "ola", "taxi", "fuel", "petrol", "diesel", "bus", "train", "flight", "metro", "fare", "parking", "auto", "ride"] },
  { category: "Shopping", keywords: ["shopping", "clothes", "shirt", "pants", "shoes", "amazon", "flipkart", "mall", "electronics", "store", "buy", "bought"] },
  { category: "Entertainment", keywords: ["movie", "cinema", "netflix", "game", "gaming", "party", "concert", "ticket", "tickets", "fun"] },
  { category: "Bills & Utilities", keywords: ["bill", "electricity", "water", "wifi", "internet", "recharge", "mobile", "gas", "utility", "bills"] },
  { category: "Healthcare", keywords: ["doctor", "medicine", "pharmacy", "hospital", "health", "checkup", "meds", "clinic", "pills"] },
  { category: "Education", keywords: ["book", "books", "course", "tuition", "school", "college", "fees", "udemy"] },
  { category: "Rent", keywords: ["rent", "house rent", "apartment rent"] },
];

/**
 * Parses spoken text transcript into structured expense fields
 * @param {string} transcript 
 * @param {Date} referenceDate 
 */
function parseVoiceTranscript(transcript, referenceDate = new Date()) {
  if (!transcript || typeof transcript !== "string") {
    return {
      amount: null,
      currency: "₹",
      category: "Other",
      description: "",
      merchant: null,
      date: new Date().toISOString(),
      rawTranscript: transcript || "",
      confidence: { amount: 0, category: 0, overall: 0 },
    };
  }

  const text = transcript.trim();
  const lower = text.toLowerCase();

  // 1. Currency Extraction
  let currency = "₹";
  if (/\b(dollar|dollars|\$|usd)\b/i.test(lower)) currency = "$";
  else if (/\b(euro|euros|€|eur)\b/i.test(lower)) currency = "€";
  else if (/\b(pound|pounds|£|gbp)\b/i.test(lower)) currency = "£";
  else if (/\b(rupee|rupees|rs|inr|₹)\b/i.test(lower)) currency = "₹";

  // 2. Amount Extraction
  let amount = null;
  
  // Direct digit match (e.g. 250, 50.75, Rs 500, $45)
  const digitMatch = lower.match(/(?:₹|rs\.?|\$|€|£)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (digitMatch && parseFloat(digitMatch[1]) > 0) {
    amount = parseFloat(digitMatch[1]);
  } else {
    // Word-based number parsing (e.g. "fifty", "two hundred fifty")
    const words = lower.split(/\s+/);
    let currentTotal = 0;
    let tempSum = 0;
    let foundNumberWord = false;

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, "");
      if (NUMBER_WORDS[cleanWord] !== undefined) {
        foundNumberWord = true;
        const val = NUMBER_WORDS[cleanWord];
        if (val === 100 || val === 1000) {
          tempSum = (tempSum || 1) * val;
        } else {
          tempSum += val;
        }
      } else if (foundNumberWord) {
        currentTotal += tempSum;
        tempSum = 0;
      }
    }
    currentTotal += tempSum;
    if (currentTotal > 0) {
      amount = currentTotal;
    }
  }

  // 3. Category Inference
  let category = "Other";
  let maxCatScore = 0;

  for (const item of CATEGORY_MAP) {
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        category = item.category;
        maxCatScore = 0.9;
        break;
      }
    }
    if (maxCatScore > 0) break;
  }

  // 4. Merchant Extraction
  let merchant = null;
  const merchantRegexes = [
    /\b(?:at|from|in)\s+([a-zA-Z0-9\s&'-]+?)(?:\s+(?:today|yesterday|this|for|on)|$)/i,
    /\b(?:to)\s+([a-zA-Z0-9\s&'-]+?)(?:\s+(?:for|today|yesterday)|$)/i,
  ];

  for (const regex of merchantRegexes) {
    const match = lower.match(regex);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const ignoreWords = ["groceries", "food", "lunch", "dinner", "cab", "rent", "bills", "today", "yesterday"];
      if (!ignoreWords.includes(candidate) && candidate.length >= 2) {
        merchant = candidate.charAt(0).toUpperCase() + candidate.slice(1);
        break;
      }
    }
  }

  // 5. Date Resolution (Relative terms)
  let dateObj = new Date(referenceDate);
  if (lower.includes("yesterday") || lower.includes("last night")) {
    dateObj.setDate(dateObj.getDate() - 1);
  } else if (lower.includes("day before yesterday")) {
    dateObj.setDate(dateObj.getDate() - 2);
  } else if (lower.includes("two days ago")) {
    dateObj.setDate(dateObj.getDate() - 2);
  }

  // 6. Description
  const description = text.charAt(0).toUpperCase() + text.slice(1);

  // Confidence calculations
  const amountConf = amount !== null ? 0.95 : 0.0;
  const categoryConf = category !== "Other" ? 0.90 : 0.60;
  const overallConf = Number(((amountConf * 0.6) + (categoryConf * 0.4)).toFixed(2));

  return {
    amount,
    currency,
    category,
    description,
    merchant,
    date: dateObj.toISOString(),
    rawTranscript: text,
    confidence: {
      amount: amountConf,
      category: categoryConf,
      overall: overallConf,
    },
  };
}

// POST /api/voice/parse-transcript
router.post("/parse-transcript", authMiddleware, async (req, res) => {
  try {
    const { transcript, currentDate } = req.body;

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return res.status(400).json({ message: "Transcript text is required" });
    }

    const refDate = currentDate ? new Date(currentDate) : new Date();
    const parsedData = parseVoiceTranscript(transcript, refDate);

    return res.json(parsedData);
  } catch (error) {
    console.error("Voice parsing route error:", error);
    return res.status(500).json({ message: "Failed to parse voice note: " + error.message });
  }
});

module.exports = router;
module.exports.parseVoiceTranscript = parseVoiceTranscript;
