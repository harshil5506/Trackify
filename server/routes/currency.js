const express = require("express");
const router = express.Router();
const https = require("https");

// Reliable baseline fallback rates (Base: 1 INR)
const FALLBACK_RATES_FROM_INR = {
  INR: 1.0,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  CAD: 0.0163,
  JPY: 1.85,
  SGD: 0.016,
  AUD: 0.018,
};

const CURRENCY_METADATA = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
};

// In-memory cache
let cachedRates = { ...FALLBACK_RATES_FROM_INR };
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Helper to fetch live rates from free Open Exchange API
const fetchLiveRates = () => {
  return new Promise((resolve) => {
    try {
      const req = https.get(
        "https://open.er-api.com/v6/latest/INR",
        { timeout: 3500 },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const json = JSON.parse(data);
              if (json && json.rates) {
                const updated = {};
                Object.keys(FALLBACK_RATES_FROM_INR).forEach((code) => {
                  updated[code] = json.rates[code] || FALLBACK_RATES_FROM_INR[code];
                });
                cachedRates = updated;
                lastFetchTime = Date.now();
                return resolve(cachedRates);
              }
            } catch {
              // fallback
            }
            resolve(cachedRates);
          });
        }
      );
      req.on("error", () => resolve(cachedRates));
      req.on("timeout", () => {
        req.destroy();
        resolve(cachedRates);
      });
    } catch {
      resolve(cachedRates);
    }
  });
};

// @route   GET /api/currency/rates
// @desc    Get live exchange rates relative to INR
router.get("/rates", async (req, res) => {
  try {
    const isStale = Date.now() - lastFetchTime > CACHE_TTL_MS;
    if (isStale) {
      // Refresh in background or awaited
      await fetchLiveRates();
    }

    res.json({
      base: "INR",
      rates: cachedRates,
      currencies: CURRENCY_METADATA,
      lastUpdated: new Date(lastFetchTime || Date.now()).toISOString(),
      isLive: lastFetchTime > 0,
    });
  } catch (err) {
    res.json({
      base: "INR",
      rates: FALLBACK_RATES_FROM_INR,
      currencies: CURRENCY_METADATA,
      lastUpdated: new Date().toISOString(),
      isLive: false,
    });
  }
});

// @route   GET /api/currency/convert
// @desc    Convert an amount between any two currencies
router.get("/convert", async (req, res) => {
  try {
    const amount = Number(req.query.amount) || 0;
    const from = (req.query.from || "INR").toUpperCase();
    const to = (req.query.to || "USD").toUpperCase();

    const rateFrom = cachedRates[from] || FALLBACK_RATES_FROM_INR[from] || 1;
    const rateTo = cachedRates[to] || FALLBACK_RATES_FROM_INR[to] || 1;

    // Convert from -> INR, then INR -> to
    const amountInINR = amount / rateFrom;
    const convertedAmount = amountInINR * rateTo;
    const directRate = rateTo / rateFrom;

    res.json({
      amount,
      from,
      to,
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      exchangeRate: Math.round(directRate * 10000) / 10000,
      fromMeta: CURRENCY_METADATA[from] || { code: from, symbol: from },
      toMeta: CURRENCY_METADATA[to] || { code: to, symbol: to },
    });
  } catch (err) {
    res.status(500).json({ error: "Conversion failed" });
  }
});

module.exports = router;
