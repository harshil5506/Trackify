const CURRENCY_CONFIG = {
  INR: { symbol: "₹", rate: 1.0, locale: "en-IN" },
  USD: { symbol: "$", rate: 0.012, locale: "en-US" },
  EUR: { symbol: "€", rate: 0.011, locale: "de-DE" },
  GBP: { symbol: "£", rate: 0.0095, locale: "en-GB" },
  AED: { symbol: "د.إ", rate: 0.044, locale: "ar-AE" },
  CAD: { symbol: "CA$", rate: 0.0163, locale: "en-CA" },
  JPY: { symbol: "¥", rate: 1.85, locale: "ja-JP" },
};

export const formatCurrency = (value = 0, options = {}) => {
  const activeCode = options.currency || localStorage.getItem("trackify_currency") || "INR";
  const config = CURRENCY_CONFIG[activeCode] || CURRENCY_CONFIG.INR;

  let rate = config.rate;
  try {
    const customRates = JSON.parse(localStorage.getItem("trackify_rates") || "{}");
    if (customRates && customRates[activeCode]) {
      rate = customRates[activeCode];
    }
  } catch {}

  const rawAmount = Number(value) || 0;
  const amount = options.skipConversion ? rawAmount : rawAmount * rate;

  const minDecimals = options.minimumFractionDigits ?? (activeCode === "JPY" ? 0 : 2);
  const maxDecimals = options.maximumFractionDigits ?? (activeCode === "JPY" ? 0 : 2);

  const formattedValue = Math.abs(amount).toLocaleString(config.locale || "en-US", {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });

  const symbol = options.symbol || config.symbol;

  if (options.signed) {
    if (amount > 0) return `+${symbol}${formattedValue}`;
    if (amount < 0) return `-${symbol}${formattedValue}`;
  }

  return `${symbol}${formattedValue}`;
};

export const getBalanceTone = (value = 0) => {
  const amount = Number(value) || 0;

  return amount < 0
    ? {
        color: "#dc2626",
        background: "#fee2e2",
        border: "#fecaca",
      }
    : {
        color: "#16a34a",
        background: "#dcfce7",
        border: "#bbf7d0",
      };
};

export const toDateTimeLocalValue = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (input) => String(input).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
