import React, { useState } from "react";
import { useCurrency } from "../context/CurrencyContext";

const CurrencyConverterCard = () => {
  const { currencies, convertCurrency, formatNativeAmount, currency: userCurrency } = useCurrency();
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState(userCurrency === "USD" ? "USD" : "INR");
  const [toCurrency, setToCurrency] = useState(userCurrency === "USD" ? "AED" : "USD");

  const numAmount = Number(amount);
  const validAmount = Number.isFinite(numAmount) && numAmount > 0 ? numAmount : 0;
  const converted = convertCurrency(validAmount, fromCurrency, toCurrency);

  // Calculate 1 unit rate for reference
  const unitRate = convertCurrency(1, fromCurrency, toCurrency);
  const inverseRate = unitRate > 0 ? 1 / unitRate : 0;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "1.05rem",
              fontWeight: "700",
              color: "#1e293b",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>💱</span> Live Currency Converter
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "3px 0 0" }}>
            Real-time cross-currency conversion with official open exchange rates
          </p>
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: "600",
            padding: "3px 8px",
            borderRadius: "6px",
            background: "#ecfdf5",
            color: "#059669",
            border: "1px solid #a7f3d0",
          }}
        >
          ● Live Rates
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr auto 1fr",
          gap: "12px",
          alignItems: "end",
        }}
      >
        {/* Amount Input */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>
            Amount
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: "600",
              outline: "none",
              color: "#0f172a",
              background: "#f8fafc",
            }}
          />
        </div>

        {/* FROM Currency */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>
            From
          </label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 10px",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "0.88rem",
              fontWeight: "600",
              outline: "none",
              cursor: "pointer",
              background: "#f8fafc",
              color: "#0f172a",
            }}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div style={{ paddingBottom: "2px" }}>
          <button
            type="button"
            onClick={handleSwap}
            title="Swap currencies"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "8px",
              border: "1.5px solid #cbd5e1",
              background: "#ffffff",
              cursor: "pointer",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              color: "#2563eb",
            }}
          >
            ⇄
          </button>
        </div>

        {/* TO Currency */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>
            To
          </label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 10px",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "0.88rem",
              fontWeight: "600",
              outline: "none",
              cursor: "pointer",
              background: "#f8fafc",
              color: "#0f172a",
            }}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Display Box */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
          border: "1px solid #bae6fd",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <p style={{ fontSize: "0.8rem", color: "#475569", margin: 0 }}>
            {formatNativeAmount(validAmount, fromCurrency)} =
          </p>
          <p
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "1.35rem",
              fontWeight: "800",
              color: "#0369a1",
              margin: "2px 0 0",
            }}
          >
            {formatNativeAmount(converted, toCurrency)}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
            1 {fromCurrency} = {unitRate < 0.01 ? unitRate.toFixed(4) : unitRate.toFixed(2)} {toCurrency}
          </p>
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", margin: "2px 0 0" }}>
            1 {toCurrency} = {inverseRate < 0.01 ? inverseRate.toFixed(4) : inverseRate.toFixed(2)} {fromCurrency}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverterCard;
