// Currency metadata dictionary
export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AED", symbol: "AED ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "SAR", symbol: "SAR ", name: "Saudi Riyal", flag: "🇸🇦" },
];

// Fallback rates relative to 1 INR (used if network API fails or offline)
const FALLBACK_INR_RATES = {
  INR: 1.0,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.82,
  AED: 0.044,
  CAD: 0.016,
  AUD: 0.018,
  SAR: 0.045,
};

let cachedRates = { ...FALLBACK_INR_RATES };
let lastFetchedTime = 0;

/**
 * Fetch latest exchange rates with INR as base
 */
export async function fetchExchangeRates() {
  const now = Date.now();
  // Cache for 30 minutes
  if (lastFetchedTime && now - lastFetchedTime < 30 * 60 * 1000) {
    return cachedRates;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR");
    const data = await res.json();
    if (data && data.rates) {
      cachedRates = { ...FALLBACK_INR_RATES, ...data.rates };
      lastFetchedTime = now;
      console.log("Exchange rates updated successfully from API ✅");
    }
  } catch (err) {
    console.warn("Using offline fallback exchange rates:", err.message);
  }
  return cachedRates;
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode = "INR") {
  const found = CURRENCIES.find((c) => c.code === currencyCode);
  return found ? found.symbol : "₹";
}

/**
 * Convert and format amount
 * Base amounts stored in DB are in INR
 */
export function formatCurrencyAmount(amount = 0, targetCurrency = "INR", rates = cachedRates) {
  const num = Number(amount) || 0;
  const rate = rates[targetCurrency] || FALLBACK_INR_RATES[targetCurrency] || 1;
  const converted = num * rate;
  const symbol = getCurrencySymbol(targetCurrency);

  // Formatting decimal places (JPY uses integer, others 2 decimals)
  const decimals = targetCurrency === "JPY" ? 0 : 2;
  const formattedNum = converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formattedNum}`;
}
