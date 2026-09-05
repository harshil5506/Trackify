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

/**
 * Convert foreign currency amount to base INR
 * rates[currency] is units of foreign currency per 1 INR (e.g. 0.044 AED = 1 INR)
 * So baseAmount (INR) = amount / rate
 */
export function convertForeignToBase(amount = 0, foreignCurrency = "INR", rates = cachedRates) {
  const num = Number(amount) || 0;
  if (foreignCurrency === "INR") return num;
  const rate = rates[foreignCurrency] || FALLBACK_INR_RATES[foreignCurrency] || 1;
  return rate > 0 ? num / rate : num;
}

/**
 * Convert base INR amount to target display currency
 */
export function convertBaseToTarget(baseAmount = 0, targetCurrency = "INR", rates = cachedRates) {
  const num = Number(baseAmount) || 0;
  if (targetCurrency === "INR") return num;
  const rate = rates[targetCurrency] || FALLBACK_INR_RATES[targetCurrency] || 1;
  return num * rate;
}

/**
 * Generic bidirectional and cross-currency conversion
 * Converts between any two supported currencies using the INR hub architecture.
 * Supports: INR <-> foreign, foreign <-> foreign, same currency -> same currency
 */
export function convertCurrency(
  amount = 0,
  fromCurrency = "INR",
  toCurrency = "INR",
  rates = cachedRates
) {
  const num = Number(amount);
  if (!Number.isFinite(num) || num === 0) return 0;

  const from = (fromCurrency || "INR").toUpperCase();
  const to = (toCurrency || "INR").toUpperCase();

  // Same currency -> same currency: return exact amount
  if (from === to) return num;

  const fromRate = rates[from] || FALLBACK_INR_RATES[from] || 1;
  const toRate = rates[to] || FALLBACK_INR_RATES[to] || 1;

  if (fromRate <= 0 || toRate <= 0) return num;

  // Step 1: fromCurrency -> Base INR
  const baseInr = from === "INR" ? num : num / fromRate;

  // Step 2: Base INR -> toCurrency
  const converted = to === "INR" ? baseInr : baseInr * toRate;

  return Number.isFinite(converted) ? converted : 0;
}

/**
 * Format an amount directly in its specified currency
 * E.g. 456 AED -> "AED 456.00"
 */
export function formatNativeAmount(amount = 0, currencyCode = "INR") {
  const num = Number(amount);
  const code = (currencyCode || "INR").toUpperCase();
  const symbol = getCurrencySymbol(code);
  const decimals = code === "JPY" ? 0 : 2;
  const safeNum = Number.isFinite(num) ? num : 0;
  const formatted = safeNum.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

export { cachedRates, FALLBACK_INR_RATES };

