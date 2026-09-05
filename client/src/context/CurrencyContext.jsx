import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  CURRENCIES,
  fetchExchangeRates,
  formatCurrencyAmount,
  getCurrencySymbol,
  convertForeignToBase,
  convertBaseToTarget,
  convertCurrency,
  formatNativeAmount,
} from "../utils/currency";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState("INR");
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  // Sync currency from user profile if available
  useEffect(() => {
    if (user && user.currency) {
      setCurrencyState(user.currency);
    }
  }, [user]);

  // Fetch live exchange rates on mount
  useEffect(() => {
    async function loadRates() {
      const liveRates = await fetchExchangeRates();
      setRates(liveRates);
      setLoading(false);
    }
    loadRates();
  }, []);

  const changeCurrency = (newCode) => {
    setCurrencyState(newCode);
  };

  const formatMoney = (baseAmount) => {
    return formatCurrencyAmount(baseAmount, currency, rates);
  };

  const activeSymbol = getCurrencySymbol(currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        changeCurrency,
        formatMoney,
        activeSymbol,
        rates,
        currencies: CURRENCIES,
        loadingRates: loading,
        convertCurrency: (amount, fromCurrency, toCurrency) =>
          convertCurrency(amount, fromCurrency, toCurrency, rates),
        convertForeignToBase: (amount, foreignCurrency) =>
          convertForeignToBase(amount, foreignCurrency, rates),
        convertBaseToTarget: (baseAmount, targetCurrency) =>
          convertBaseToTarget(baseAmount, targetCurrency || currency, rates),
        formatNativeAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside CurrencyProvider
    return {
      currency: "INR",
      activeSymbol: "₹",
      formatMoney: (val) => `₹${Number(val || 0).toFixed(2)}`,
      changeCurrency: () => {},
      currencies: CURRENCIES,
      rates: {},
      convertCurrency: (val) => Number(val || 0),
      convertForeignToBase: (val) => Number(val || 0),
      convertBaseToTarget: (val) => Number(val || 0),
      formatNativeAmount: (val, cur = "INR") => `${cur} ${Number(val || 0).toFixed(2)}`,
    };
  }
  return context;
};


