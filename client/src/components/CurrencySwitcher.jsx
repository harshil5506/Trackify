import { useState, useRef, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";

const CurrencySwitcher = () => {
  const {
    currency,
    currentMeta,
    currencies,
    changeCurrency,
    rates,
    openConverter,
  } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code) => {
    changeCurrency(code);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      {/* Switcher Pill Button in Navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={s.pillBtn}
        title="Switch Display Currency & Rates"
      >
        <span style={{ fontSize: "1.1rem" }}>{currentMeta.flag}</span>
        <span style={s.pillText}>
          {currentMeta.code} ({currentMeta.symbol})
        </span>
        <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>▼</span>
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div style={s.dropdown}>
          <div style={s.dropdownHeader}>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
              Select Currency
            </span>
          </div>

          <div style={s.currencyList}>
            {Object.values(currencies).map((c) => {
              const isSelected = c.code === currency;
              const rateVal = rates[c.code] || 1;
              const inrVal = c.code === "INR" ? 1 : Math.round((1 / rateVal) * 100) / 100;

              return (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  style={{
                    ...s.itemBtn,
                    background: isSelected ? "#eff6ff" : "transparent",
                    borderLeft: isSelected ? "3px solid #1a2ea8" : "3px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.25rem" }}>{c.flag}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ fontSize: "0.88rem", color: "#0f172a" }}>
                          {c.code}
                        </strong>
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          ({c.symbol})
                        </span>
                      </div>
                      <p style={{ margin: "1px 0 0 0", fontSize: "0.72rem", color: "#94a3b8" }}>
                        {c.name}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {isSelected ? (
                      <span style={{ color: "#1a2ea8", fontWeight: "700", fontSize: "0.9rem" }}>
                        ✓ Active
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                        1 {c.code} ≈ ₹{inrVal}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calculator Tool Trigger */}
          <div style={s.dropdownFooter}>
            <button
              onClick={() => {
                setIsOpen(false);
                openConverter();
              }}
              style={s.calcBtn}
            >
              💱 Currency Calculator Tool
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  pillBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: "20px",
    padding: "6px 12px",
    color: "white",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  pillText: {
    fontFamily: "'Sora', sans-serif",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: "280px",
    background: "white",
    borderRadius: "14px",
    boxShadow: "0 14px 35px rgba(0,0,0,0.18)",
    border: "1px solid #e2e8f0",
    zIndex: 9999,
    overflow: "hidden",
    animation: "fadeIn 0.15s ease",
  },
  dropdownHeader: {
    padding: "12px 16px 8px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  currencyList: {
    maxHeight: "260px",
    overflowY: "auto",
    padding: "4px 0",
  },
  itemBtn: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 14px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  dropdownFooter: {
    padding: "8px 12px",
    borderTop: "1px solid #f1f5f9",
    background: "#f8fafc",
  },
  calcBtn: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#1a2ea8",
    fontSize: "0.82rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};

export default CurrencySwitcher;
