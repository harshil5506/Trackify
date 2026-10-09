import { useState } from "react";
import { useCurrency } from "../context/CurrencyContext";

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000];

const CurrencyConverterModal = ({ isOpen, onClose }) => {
  const { currencies, convertBetween, rates } = useCurrency();
  const [amount, setAmount] = useState("100");
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("INR");

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const converted = convertBetween(numAmount, fromCode, toCode);
  const singleUnitRate = convertBetween(1, fromCode, toCode);

  const fromMeta = currencies[fromCode] || { symbol: fromCode, flag: "" };
  const toMeta = currencies[toCode] || { symbol: toCode, flag: "" };

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.5rem" }}>💱</span>
            <div>
              <h2 style={s.title}>Live Currency Converter</h2>
              <p style={s.subtitle}>Real-time international exchange calculator</p>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn}>
            ✕
          </button>
        </div>

        {/* Input & Selector Row */}
        <div style={s.conversionBox}>
          {/* From */}
          <div style={s.currCol}>
            <label style={s.label}>You send / have</label>
            <div style={s.inputWrap}>
              <select
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value)}
                style={s.select}
              >
                {Object.values(currencies).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                style={s.amountInput}
              />
            </div>
          </div>

          {/* Swap button */}
          <div style={s.swapWrap}>
            <button
              onClick={handleSwap}
              style={s.swapBtn}
              title="Swap currencies"
            >
              ⇄
            </button>
          </div>

          {/* To */}
          <div style={s.currCol}>
            <label style={s.label}>You receive / converted</label>
            <div style={s.inputWrap}>
              <select
                value={toCode}
                onChange={(e) => setToCode(e.target.value)}
                style={s.select}
              >
                {Object.values(currencies).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <div style={s.resultDisplay}>
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>{toMeta.symbol}</span>
                <strong style={{ fontSize: "1.25rem", color: "#0f172a" }}>
                  {converted.toLocaleString(undefined, {
                    minimumFractionDigits: toCode === "JPY" ? 0 : 2,
                    maximumFractionDigits: toCode === "JPY" ? 0 : 2,
                  })}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Live rate info badge */}
        <div style={s.rateBadge}>
          <span style={{ fontSize: "0.85rem", color: "#475569" }}>
            Exchange Rate:{" "}
            <strong>
              1 {fromCode} = {singleUnitRate.toFixed(4)} {toCode}
            </strong>
          </span>
          <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "700" }}>
            ● Live Rates Active
          </span>
        </div>

        {/* Quick Amount Cheatsheet */}
        <div style={s.cheatsheet}>
          <p style={s.cheatTitle}>Quick Conversions ({fromCode} → {toCode}):</p>
          <div style={s.cheatGrid}>
            {QUICK_AMOUNTS.map((q) => {
              const res = convertBetween(q, fromCode, toCode);
              return (
                <div key={q} style={s.cheatPill}>
                  <span style={{ color: "#64748b" }}>{fromMeta.symbol}{q} =</span>
                  <strong style={{ color: "#1a2ea8" }}>
                    {toMeta.symbol}{res.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={onClose} style={s.doneBtn}>
          Done
        </button>
      </div>
    </div>
  );
};

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "20px",
  },
  modal: {
    background: "white",
    borderRadius: "20px",
    padding: "26px",
    width: "100%",
    maxWidth: "540px",
    boxShadow: "0 20px 45px rgba(0,0,0,0.2)",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#0f172a",
    fontFamily: "'Sora', sans-serif",
  },
  subtitle: {
    margin: "2px 0 0 0",
    fontSize: "0.82rem",
    color: "#64748b",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "1.2rem",
    color: "#64748b",
    cursor: "pointer",
  },
  conversionBox: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
  },
  currCol: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputWrap: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.8fr",
    gap: "10px",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "white",
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#0f172a",
    outline: "none",
    cursor: "pointer",
  },
  amountInput: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid #cbd5e1",
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#0f172a",
    outline: "none",
    textAlign: "right",
  },
  resultDisplay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "6px",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "#eff6ff",
    border: "1.5px solid #bfdbfe",
  },
  swapWrap: {
    display: "flex",
    justifyContent: "center",
    margin: "-6px 0",
  },
  swapBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1.5px solid #cbd5e1",
    background: "white",
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    transition: "transform 0.15s ease",
  },
  rateBadge: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "14px 0",
    padding: "8px 12px",
    background: "#f1f5f9",
    borderRadius: "10px",
  },
  cheatsheet: {
    marginBottom: "18px",
  },
  cheatTitle: {
    fontSize: "0.78rem",
    fontWeight: "600",
    color: "#64748b",
    margin: "0 0 8px 0",
  },
  cheatGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  cheatPill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "0.8rem",
  },
  doneBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#1a2ea8",
    color: "white",
    fontWeight: "700",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
};

export default CurrencyConverterModal;
