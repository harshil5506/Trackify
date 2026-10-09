import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

export const CURRENCY_MAP = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", locale: "en-IN" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", locale: "en-GB" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪", locale: "ar-AE" },
  CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦", locale: "en-CA" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", locale: "ja-JP" },
};

export const DEFAULT_RATES_FROM_INR = {
  INR: 1.0,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  CAD: 0.0163,
  JPY: 1.85,
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem("trackify_currency") || "INR";
  });
  const [rates, setRates] = useState(DEFAULT_RATES_FROM_INR);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  // Fetch live exchange rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await API.get("/api/currency/rates");
        if (res.data && res.data.rates) {
          setRates((prev) => ({ ...prev, ...res.data.rates }));
          localStorage.setItem("trackify_rates", JSON.stringify(res.data.rates));
        }
      } catch (err) {
        // Fallback to cached rates in localStorage or default
        const cached = localStorage.getItem("trackify_rates");
        if (cached) {
          try {
            setRates(JSON.parse(cached));
          } catch {}
        }
      }
    };
    fetchRates();
  }, []);

  const changeCurrency = async (newCode) => {
    if (!CURRENCY_MAP[newCode]) return;
    setCurrencyState(newCode);
    localStorage.setItem("trackify_currency", newCode);

    // Optionally sync with user profile in background
    try {
      await API.put("/api/user/profile", { currency: newCode });
    } catch {}
  };

  // Convert an amount in INR into the currently selected (or specified) currency
  const convert = (amountInINR = 0, targetCode = currency) => {
    const num = Number(amountInINR) || 0;
    const rate = rates[targetCode] || DEFAULT_RATES_FROM_INR[targetCode] || 1;
    return num * rate;
  };

  // Format an amount (assuming base is INR) into the active currency representation
  const format = (amountInINR = 0, options = {}) => {
    const active = CURRENCY_MAP[currency] || CURRENCY_MAP.INR;
    const converted = convert(amountInINR, currency);
    const abs = Math.abs(converted);

    const formattedNum = abs.toLocaleString(active.locale || "en-US", {
      minimumFractionDigits: options.minimumFractionDigits ?? (currency === "JPY" ? 0 : 2),
      maximumFractionDigits: options.maximumFractionDigits ?? (currency === "JPY" ? 0 : 2),
    });

    if (options.signed) {
      if (converted > 0) return `+${active.symbol}${formattedNum}`;
      if (converted < 0) return `-${active.symbol}${formattedNum}`;
    }

    return `${active.symbol}${formattedNum}`;
  };

  // Convert between ANY two currencies
  const convertBetween = (amount, fromCode, toCode) => {
    const num = Number(amount) || 0;
    const rateFrom = rates[fromCode] || DEFAULT_RATES_FROM_INR[fromCode] || 1;
    const rateTo = rates[toCode] || DEFAULT_RATES_FROM_INR[toCode] || 1;
    const inINR = num / rateFrom;
    return inINR * rateTo;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currentMeta: CURRENCY_MAP[currency] || CURRENCY_MAP.INR,
        currencies: CURRENCY_MAP,
        rates,
        changeCurrency,
        convert,
        format,
        convertBetween,
        isConverterOpen,
        openConverter: () => setIsConverterOpen(true),
        closeConverter: () => setIsConverterOpen(false),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback safe dummy if rendered outside provider
    return {
      currency: "INR",
      currentMeta: CURRENCY_MAP.INR,
      currencies: CURRENCY_MAP,
      rates: DEFAULT_RATES_FROM_INR,
      changeCurrency: () => {},
      convert: (v) => v,
      format: (v) => `₹${Number(v).toFixed(2)}`,
      convertBetween: (v) => v,
      isConverterOpen: false,
      openConverter: () => {},
      closeConverter: () => {},
    };
  }
  return context;
};
