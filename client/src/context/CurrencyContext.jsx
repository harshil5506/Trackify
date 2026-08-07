import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  CURRENCIES,
  fetchExchangeRates,
  formatCurrencyAmount,
  getCurrencySymbol,
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

  const formatMoney = (amount) => {
    return formatCurrencyAmount(amount, currency, rates);
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
    };
  }
  return context;
};
