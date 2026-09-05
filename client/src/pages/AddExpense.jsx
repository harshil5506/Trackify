import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency, toDateTimeLocalValue } from "../utils/finance";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Rent",
  "Other",
];

const INCOME_CATEGORIES = [
  "Business",
  "Job",
  "Part-Time Job",
  "Stock Market",
  "Freelancing",
  "Investments",
  "Rental Income",
  "Passive Income",
  "Other",
];

const MONTHS = [
  { value: 1, name: "Jan (01)" },
  { value: 2, name: "Feb (02)" },
  { value: 3, name: "Mar (03)" },
  { value: 4, name: "Apr (04)" },
  { value: 5, name: "May (05)" },
  { value: 6, name: "Jun (06)" },
  { value: 7, name: "Jul (07)" },
  { value: 8, name: "Aug (08)" },
  { value: 9, name: "Sep (09)" },
  { value: 10, name: "Oct (10)" },
  { value: 11, name: "Nov (11)" },
  { value: 12, name: "Dec (12)" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i);

const AddExpense = () => {
  const {
    currency: userCurrency,
    currencies,
    rates,
    convertForeignToBase,
    convertCurrency,
    formatNativeAmount,
  } = useCurrency();
  const navigate = useNavigate();
  const [activeMethod, setActiveMethod] = useState("text");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    currency: userCurrency || "INR",
    category: "Food",
    paymentMethod: "Cash",
    dateTime: toDateTimeLocalValue(new Date()),
    description: "",
    merchant: "",
  });

  useEffect(() => {
    if (userCurrency && !form.currency) {
      setForm((prev) => ({ ...prev, currency: userCurrency }));
    }
  }, [userCurrency]);

  const availableCategories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleTypeChange = (nextType) => {
    setType(nextType);
    setForm((current) => ({
      ...current,
      category:
        nextType === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  const handleDatePartChange = (part, value) => {
    const current = new Date(form.dateTime || Date.now());
    let y = current.getFullYear();
    let m = current.getMonth(); // 0-indexed
    let d = current.getDate();
    let hours = current.getHours();
    let minutes = current.getMinutes();

    if (part === "year") y = Number(value);
    if (part === "month") m = Number(value) - 1;
    if (part === "day") d = Number(value);
    if (part === "time") {
      const parts = (value || "12:00").split(":");
      hours = Number(parts[0]) || 0;
      minutes = Number(parts[1]) || 0;
    }

    // Clamp day to max days in the selected month & year
    const maxDays = new Date(y, m + 1, 0).getDate();
    d = Math.min(d, maxDays);

    const updatedDate = new Date(y, m, d, hours, minutes);
    setForm((prev) => ({ ...prev, dateTime: toDateTimeLocalValue(updatedDate) }));
  };

  const dateObj = new Date(form.dateTime || Date.now());
  const selectedDay = !Number.isNaN(dateObj.getTime()) ? dateObj.getDate() : new Date().getDate();
  const selectedMonth = !Number.isNaN(dateObj.getTime()) ? dateObj.getMonth() + 1 : new Date().getMonth() + 1;
  const selectedYear = !Number.isNaN(dateObj.getTime()) ? dateObj.getFullYear() : CURRENT_YEAR;
  const padTwo = (n) => String(n).padStart(2, "0");
  const selectedTime = !Number.isNaN(dateObj.getTime())
    ? `${padTwo(dateObj.getHours())}:${padTwo(dateObj.getMinutes())}`
    : "12:00";
  const daysInCurrentMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  const handleSubmit = async () => {
    if (!form.amount) return toast.error("Amount is required");
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return toast.error("Amount must be greater than 0");
    }

    if (!form.dateTime) return toast.error("Transaction date is required");
    const parsedDate = new Date(form.dateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return toast.error("Please provide a valid transaction date");
    }
    if (parsedDate > new Date()) {
      return toast.error("Transaction date cannot be in the future");
    }

    setLoading(true);
    try {
      const txnCurrency = form.currency || "INR";
      const rate = rates[txnCurrency] || 1.0;
      const baseAmount = Math.round(convertForeignToBase(amount, txnCurrency) * 100) / 100;

      await API.post("/api/expenses", {
        title: form.description || form.merchant || "Transaction",
        amount,
        currency: txnCurrency,
        exchangeRate: rate,
        baseAmount,
        category: form.category,
        paymentMethod: form.paymentMethod,
        date: parsedDate.toISOString(),
        note: form.description,
        merchant: form.merchant,
        type,
      });
      toast.success("Transaction added!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.appBody}>
      <main style={s.dashMain}>
        <div style={s.dashCard}>
          <div style={s.headerRow}>
            <div>
              <h2 style={s.title}>Add New Transaction</h2>
              <p style={s.subtitle}>
                Capture income or expense quickly with a smoother,
                mobile-friendly form.
              </p>
            </div>
            <div style={s.previewChip}>
              <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                Preview
              </span>
              <strong
                style={{ color: type === "income" ? "#16a34a" : "#dc2626" }}
              >
                {type === "income" ? "+" : "-"}
                {formatCurrency(form.amount || 0)}
              </strong>
            </div>
          </div>
          <p style={s.helperText}>Choose your preferred input method:</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "16px",
            }}
          >
            {[
              {
                key: "voice",
                bg: "#e3ebff",
                ibg: "#1a2ea8",
                icon: "🎤",
                label: "Voice Input",
                sub: "Speak to add",
                lc: "#1a2ea8",
                sc: "#4a6cf7",
              },
              {
                key: "text",
                bg: "#d6f5e8",
                ibg: "#0d7a68",
                icon: "📝",
                label: "Text Input",
                sub: "Type details",
                lc: "#0d7a68",
                sc: "#0d9488",
              },
              {
                key: "scan",
                bg: "#fdf3d0",
                ibg: "#7c3000",
                icon: "📷",
                label: "Scan Receipt",
                sub: "Upload receipt",
                lc: "#7c3000",
                sc: "#b45309",
              },
            ].map((m) => (
              <div
                key={m.key}
                onClick={() => setActiveMethod(m.key)}
                style={{
                  borderRadius: "12px",
                  padding: "30px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: m.bg,
                  border:
                    activeMethod === m.key
                      ? "2px solid rgba(26,46,168,0.3)"
                      : "2px solid transparent",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                    background: m.ibg,
                    fontSize: "24px",
                  }}
                >
                  {m.icon}
                </div>
                <p
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "0.92rem",
                    fontWeight: "700",
                    marginBottom: "5px",
                    color: m.lc,
                  }}
                >
                  {m.label}
                </p>
                <p style={{ fontSize: "0.77rem", color: m.sc }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={s.dashCard}>
          <h3
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1rem",
              fontWeight: "700",
              color: "#2d47c9",
              marginBottom: "22px",
            }}
          >
            Expense Details
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div style={s.field}>
              <label style={s.label}>Amount & Currency *</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  background: "#f9fafb",
                  overflow: "hidden",
                }}
              >
                <select
                  name="currency"
                  value={form.currency || "INR"}
                  onChange={handleChange}
                  style={{
                    padding: "0 10px",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    color: "#1a1a2e",
                    border: "none",
                    borderRight: "1.5px solid #d1d5db",
                    height: "44px",
                    background: "#f3f4f6",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  style={{
                    border: "none",
                    background: "transparent",
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    outline: "none",
                    color: "#000",
                  }}
                />
              </div>
              {(() => {
                const num = Number(form.amount);
                if (!Number.isFinite(num) || num <= 0) return null;
                const txnCur = form.currency || "INR";
                const prefCur = userCurrency || "INR";

                if (txnCur !== prefCur) {
                  const prefVal = convertCurrency(num, txnCur, prefCur);
                  const baseVal = convertForeignToBase(num, txnCur);
                  return (
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "#4f46e5",
                        fontWeight: "600",
                        marginTop: "6px",
                        background: "#eef2ff",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        display: "inline-block",
                      }}
                    >
                      💱 Approx: {formatNativeAmount(prefVal, prefCur)}
                      {prefCur !== "INR" && (
                        <span style={{ color: "#6b7280", fontWeight: "500", marginLeft: "6px" }}>
                          (Base: ≈ ₹{baseVal.toFixed(2)} INR)
                        </span>
                      )}
                    </p>
                  );
                }

                if (txnCur !== "INR") {
                  const baseVal = convertForeignToBase(num, txnCur);
                  return (
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "#4f46e5",
                        fontWeight: "600",
                        marginTop: "6px",
                        background: "#eef2ff",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        display: "inline-block",
                      }}
                    >
                      💱 Base: ≈ ₹{baseVal.toFixed(2)} INR
                    </p>
                  );
                }

                return null;
              })()}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
              }}
            >
              <div style={s.field}>
                <label style={s.label}>Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={s.select}
                >
                  {availableCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  style={s.select}
                >
                  {[
                    "Cash",
                    "Credit Card",
                    "Debit Card",
                    "Bank Transfer",
                    "UPI",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
              }}
            >
              <div style={s.field}>
                <label style={s.label}>Date & Time (Day • Month • Year • Time)</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.6fr 1.3fr 1.3fr",
                    gap: "8px",
                  }}
                >
                  {/* Day Picker */}
                  <select
                    value={selectedDay}
                    onChange={(e) => handleDatePartChange("day", e.target.value)}
                    style={{ ...s.select, padding: "10px 8px", fontSize: "0.86rem" }}
                  >
                    {daysArray.map((d) => (
                      <option key={d} value={d}>
                        Day {d}
                      </option>
                    ))}
                  </select>

                  {/* Month Picker */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleDatePartChange("month", e.target.value)}
                    style={{ ...s.select, padding: "10px 8px", fontSize: "0.86rem" }}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  {/* Year Picker */}
                  <select
                    value={selectedYear}
                    onChange={(e) => handleDatePartChange("year", e.target.value)}
                    style={{ ...s.select, padding: "10px 8px", fontSize: "0.86rem" }}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  {/* Time Picker */}
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => handleDatePartChange("time", e.target.value)}
                    style={{ ...s.input, padding: "8px 6px", fontSize: "0.86rem" }}
                  />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Recorded At</label>
                <div style={s.readOnlyBox}>
                  <span style={{ fontSize: "0.92rem", color: "#475569" }}>
                    {(() => {
                      if (!form.dateTime) return "No date selected";
                      const d = new Date(form.dateTime);
                      return Number.isNaN(d.getTime())
                        ? "Invalid date"
                        : d.toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          });
                    })()}
                  </span>
                </div>
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Description</label>
              <input
                type="text"
                name="description"
                placeholder="What was this for?"
                value={form.description}
                onChange={handleChange}
                style={s.input}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Merchant / Vendor</label>
              <input
                type="text"
                name="merchant"
                placeholder="e.g. Amazon, Starbucks"
                value={form.merchant}
                onChange={handleChange}
                style={s.input}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Transaction Type</label>
              <div
                style={{
                  display: "flex",
                  border: "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  overflow: "hidden",
                  width: "fit-content",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleTypeChange("expense")}
                  style={{
                    padding: "9px 30px",
                    border: "none",
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "0.86rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    background: type === "expense" ? "#fee2e2" : "white",
                    color: type === "expense" ? "#dc2626" : "#666",
                  }}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("income")}
                  style={{
                    padding: "9px 30px",
                    border: "none",
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "0.86rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    background: type === "income" ? "#dcfce7" : "white",
                    color: type === "income" ? "#16a34a" : "#666",
                  }}
                >
                  Income
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                style={{
                  padding: "10px 24px",
                  border: "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  background: "white",
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "0.86rem",
                  fontWeight: "600",
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "10px 24px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#1a2ea8",
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "0.86rem",
                  fontWeight: "600",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {loading ? "Adding..." : "Add Transaction"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const s = {
  appBody: {
    background: "linear-gradient(180deg,#eef0f7 0%,#f8fafc 100%)",
    minHeight: "100vh",
    fontFamily: "'Inter',sans-serif",
  },
  appNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 36px",
    height: "60px",
    background: "#1a2ea8",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  appNavBrand: { display: "flex", alignItems: "center", gap: "10px" },
  appLogoFallback: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#4a6cf7",
    color: "white",
    fontFamily: "'Sora',sans-serif",
    fontSize: "16px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  appBrandName: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "19px",
    fontWeight: "700",
    color: "white",
  },
  appNavLinks: {
    display: "flex",
    gap: "30px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  appNavLink: {
    color: "rgba(255,255,255,0.78)",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
  },
  appNavRight: { display: "flex", alignItems: "center", gap: "12px" },
  notifBtn: {
    position: "relative",
    background: "rgba(255,255,255,0.14)",
    border: "none",
    borderRadius: "8px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "white",
    fontSize: "16px",
  },
  notifBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    width: "17px",
    height: "17px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  appUserChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#2d47c9",
    borderRadius: "8px",
    padding: "5px 10px 5px 5px",
  },
  appAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  appUsername: { fontSize: "12px", color: "white" },
  logoutBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: "8px",
    padding: "6px 14px",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  dashMain: {
    maxWidth: "1060px",
    margin: "0 auto",
    padding: "28px 28px 60px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  dashCard: {
    background: "white",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
    padding: "28px",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "2px",
  },
  title: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "0.92rem",
    color: "#64748b",
    lineHeight: 1.6,
    maxWidth: "620px",
  },
  previewChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
    padding: "12px 16px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    minWidth: "160px",
  },
  helperText: {
    fontSize: "0.88rem",
    color: "#64748b",
    marginBottom: "8px",
  },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "0.82rem", fontWeight: "700", color: "#0f172a" },
  input: {
    padding: "13px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "0.92rem",
    fontFamily: "'Inter',sans-serif",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
  },
  select: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "0.92rem",
    fontFamily: "'Inter',sans-serif",
    color: "#0f172a",
    background: "#ffffff",
    cursor: "pointer",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
  },
  helperSmall: {
    fontSize: "0.74rem",
    color: "#64748b",
  },
  readOnlyBox: {
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    borderRadius: "12px",
    border: "1px dashed #cbd5e1",
    background: "#f8fafc",
  },
};

export default AddExpense;
