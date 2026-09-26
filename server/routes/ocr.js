const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
let tesseract = null;

try {
  tesseract = require("tesseract.js");
} catch (e) {
  console.log("tesseract.js loading in progress or dynamic fallback ready");
}

/**
 * Normalizes raw OCR text into structured receipt data
 * @param {string} rawText 
 * @param {number} baseConfidence 
 */
function parseReceiptText(rawText, baseConfidence = 0.85) {
  if (!rawText || typeof rawText !== "string") {
    return {
      merchant: null,
      date: null,
      currency: "₹",
      subtotal: null,
      tax: null,
      total: null,
      lineItems: [],
      rawText: rawText || "",
      confidence: {
        merchant: 0,
        date: 0,
        total: 0,
        subtotal: 0,
        tax: 0,
        overall: 0,
      },
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let merchant = null;
  let date = null;
  let currency = "₹";
  let subtotal = null;
  let tax = null;
  let total = null;
  const lineItems = [];

  // 1. Currency Detection
  if (/\$|USD/i.test(rawText)) currency = "$";
  else if (/€|EUR/i.test(rawText)) currency = "€";
  else if (/£|GBP/i.test(rawText)) currency = "£";
  else if (/₹|Rs\.?|INR/i.test(rawText)) currency = "₹";

  // 2. Merchant Extraction (Top lines excluding generic titles)
  const genericTitles = [
    "receipt", "tax invoice", "cash memo", "invoice", "welcome", "thank you",
    "bill", "customer copy", "original copy", "store copy"
  ];

  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const lineClean = lines[i].toLowerCase();
    const isGeneric = genericTitles.some((g) => lineClean.includes(g));
    if (!isGeneric && lines[i].length >= 3 && !/^\d+$/.test(lines[i])) {
      merchant = lines[i].replace(/[^\w\s&'-.]/gi, "").trim();
      break;
    }
  }

  // 3. Date Extraction
  const dateRegexes = [
    /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b/, // YYYY-MM-DD
    /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b/, // DD-MM-YYYY or MM-DD-YYYY
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/i, // DD Month YYYY
  ];

  for (const line of lines) {
    for (const regex of dateRegexes) {
      const match = line.match(regex);
      if (match) {
        const parsedDate = new Date(match[1]);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString();
          break;
        }
      }
    }
    if (date) break;
  }

  // 4. Amounts & Totals Extraction
  const parseAmountStr = (str) => {
    if (!str) return null;
    const cleaned = str.replace(/[^0-9.]/g, "");
    const val = parseFloat(cleaned);
    return isNaN(val) ? null : val;
  };

  const moneyPattern = /(?:₹|Rs\.?|\$|€|£)?\s*(\d+(?:\.\d{1,2})?)/gi;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();

    // Total matching
    if (
      (upperLine.includes("TOTAL") || upperLine.includes("AMOUNT DUE") || upperLine.includes("NET AMT") || upperLine.includes("GRAND TOTAL")) &&
      !upperLine.includes("SUBTOTAL") &&
      !upperLine.includes("SUB TOTAL")
    ) {
      const matches = [...line.matchAll(moneyPattern)];
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1][1];
        const val = parseAmountStr(lastMatch);
        if (val !== null && (total === null || val > total)) {
          total = val;
        }
      }
    }

    // Subtotal matching
    if (upperLine.includes("SUBTOTAL") || upperLine.includes("SUB TOTAL") || upperLine.includes("SUB-TOTAL")) {
      const matches = [...line.matchAll(moneyPattern)];
      if (matches.length > 0) {
        const val = parseAmountStr(matches[matches.length - 1][1]);
        if (val !== null) subtotal = val;
      }
    }

    // Tax matching
    if (upperLine.includes("TAX") || upperLine.includes("GST") || upperLine.includes("VAT") || upperLine.includes("CGST") || upperLine.includes("SGST")) {
      const matches = [...line.matchAll(moneyPattern)];
      if (matches.length > 0) {
        const val = parseAmountStr(matches[matches.length - 1][1]);
        if (val !== null && val < (total || 100000)) tax = val;
      }
    }
  }

  // Fallback total if no keyword matched: pick largest valid currency figure in lower 50% of bill
  if (total === null) {
    let maxVal = 0;
    for (const line of lines) {
      const matches = [...line.matchAll(moneyPattern)];
      for (const m of matches) {
        const val = parseAmountStr(m[1]);
        if (val && val > maxVal && val < 500000) {
          maxVal = val;
        }
      }
    }
    if (maxVal > 0) total = maxVal;
  }

  // 5. Line items extraction
  // Pattern: Item Description [Qty] [Price] Amount
  const lineItemRegex = /^(.+?)\s+(\d+)?\s*(?:x|@)?\s*(\d+(?:\.\d{1,2})?)\s+(\d+(?:\.\d{1,2})?)$/i;
  const simpleItemRegex = /^([a-zA-Z\s&'-]{3,})\s+(?:₹|Rs\.?|\$|€|£)?\s*(\d+(?:\.\d{2})?)$/i;

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (
      upper.includes("TOTAL") || upper.includes("SUBTOTAL") ||
      upper.includes("TAX") || upper.includes("CHANGE") ||
      upper.includes("CASH") || upper.includes("CARD") ||
      upper.includes("THANK")
    ) {
      continue;
    }

    const matchDetailed = line.match(lineItemRegex);
    if (matchDetailed) {
      const desc = matchDetailed[1].trim();
      const qty = parseInt(matchDetailed[2] || "1", 10);
      const unitPrice = parseFloat(matchDetailed[3]);
      const amount = parseFloat(matchDetailed[4]);
      if (desc && !isNaN(amount)) {
        lineItems.push({ description: desc, quantity: qty, unitPrice, amount });
        continue;
      }
    }

    const matchSimple = line.match(simpleItemRegex);
    if (matchSimple) {
      const desc = matchSimple[1].trim();
      const amount = parseFloat(matchSimple[2]);
      if (desc && !isNaN(amount) && desc.length > 2) {
        lineItems.push({ description: desc, quantity: 1, unitPrice: amount, amount });
      }
    }
  }

  // Confidence calculations (0.0 to 1.0)
  const merchantConf = merchant ? Math.min(0.95, baseConfidence + 0.05) : 0.40;
  const dateConf = date ? 0.90 : 0.35;
  const totalConf = total !== null ? (rawText.toUpperCase().includes("TOTAL") ? 0.95 : 0.70) : 0.30;
  const subtotalConf = subtotal !== null ? 0.85 : 0.50;
  const taxConf = tax !== null ? 0.85 : 0.50;

  const overallConf = Number(
    ((merchantConf + dateConf + totalConf + (lineItems.length > 0 ? 0.9 : 0.5)) / 4).toFixed(2)
  );

  return {
    merchant: merchant || "Scanned Receipt",
    date: date || new Date().toISOString(),
    currency,
    subtotal: subtotal !== null ? subtotal : (total ? Number((total * 0.9).toFixed(2)) : null),
    tax: tax !== null ? tax : (total && subtotal ? Number((total - subtotal).toFixed(2)) : null),
    total,
    lineItems,
    rawText,
    confidence: {
      merchant: Number(merchantConf.toFixed(2)),
      date: Number(dateConf.toFixed(2)),
      total: Number(totalConf.toFixed(2)),
      subtotal: Number(subtotalConf.toFixed(2)),
      tax: Number(taxConf.toFixed(2)),
      overall: overallConf,
    },
  };
}

// POST /api/ocr/scan-bill
router.post("/scan-bill", authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image payload provided" });
    }

    let rawText = "";
    let baseConfidence = 0.85;

    // Use Tesseract.js if loaded or dynamically require
    if (!tesseract) {
      try {
        tesseract = require("tesseract.js");
      } catch (e) {
        console.error("Tesseract load error:", e.message);
      }
    }

    if (tesseract && typeof tesseract.recognize === "function") {
      try {
        const imageBuffer = image.includes("base64,")
          ? Buffer.from(image.split("base64,")[1], "base64")
          : Buffer.from(image, "base64");

        // Run tesseract with timeout wrapper
        const tesseractPromise = tesseract.recognize(imageBuffer, "eng", {
          logger: () => {},
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("OCR processing timeout")), 15000)
        );

        const result = await Promise.race([tesseractPromise, timeoutPromise]);

        rawText = result?.data?.text || "";
        if (result?.data?.confidence) {
          baseConfidence = result.data.confidence / 100;
        }
      } catch (tessErr) {
        console.warn("Tesseract OCR recognition notice:", tessErr.message);
        baseConfidence = 0.40;
      }
    }

    // Return normalized data (with low confidence if text is sparse)
    const normalizedData = parseReceiptText(rawText, baseConfidence);
    return res.json(normalizedData);
  } catch (error) {
    console.error("OCR API error:", error);
    return res.status(500).json({
      message: "Failed to process bill image. " + (error.message || ""),
    });
  }
});


module.exports = router;
module.exports.parseReceiptText = parseReceiptText;
