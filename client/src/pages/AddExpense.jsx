import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const AddExpense = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMethod, setActiveMethod] = useState("text");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "Food",
    paymentMethod: "Cash",
    date: new Date().toISOString().split("T")[0],
    time: "",
    description: "",
    merchant: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.amount) return toast.error("Amount is required");
    setLoading(true);
    try {
      await API.post("/api/expenses", {
        amount: parseFloat(form.amount),
        category: form.category,
        paymentMethod: form.paymentMethod,
        date: form.date,
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

  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <div style={s.appBody}>
      <nav style={s.appNav}>
        <div style={s.appNavBrand}>
          <div style={s.appLogoFallback}>T</div>
          <span style={s.appBrandName}>Trackify</span>
        </div>
        <ul style={s.appNavLinks}>
          <li>
            <Link to="/dashboard" style={s.appNavLink}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/add-expense" style={{ ...s.appNavLink, color: "white" }}>
              Add Expense
            </Link>
          </li>
          <li>
            <Link to="/transactions" style={s.appNavLink}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/reports" style={s.appNavLink}>
              Reports
            </Link>
          </li>
          <li>
            <Link to="/budget" style={s.appNavLink}>
              Budget
            </Link>
          </li>
        </ul>
        <div style={s.appNavRight}>
          <button style={s.notifBtn}>
            🔔<span style={s.notifBadge}>2</span>
          </button>
          <div style={s.appUserChip}>
            <div style={s.appAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={s.appUsername}>{user?.name}</span>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main style={s.dashMain}>
        <div style={s.dashCard}>
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1.4rem",
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: "6px",
            }}
          >
            Add New Transaction
          </h2>
          <p
            style={{ fontSize: "0.88rem", color: "#666", marginBottom: "20px" }}
          >
            Choose your preferred input method:
          </p>
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
              <label style={s.label}>Amount *</label>
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
                <span
                  style={{
                    padding: "0 14px",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                    borderRight: "1.5px solid #d1d5db",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    background: "#f3f4f6",
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                  style={{
                    border: "none",
                    background: "transparent",
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
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
                <label style={s.label}>Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={s.select}
                >
                  {[
                    "Food",
                    "Transportation",
                    "Shopping",
                    "Entertainment",
                    "Bills & Utilities",
                    "Healthcare",
                    "Other",
                  ].map((c) => (
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
                <label style={s.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={s.input}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  style={s.input}
                />
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
                  onClick={() => setType("expense")}
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
                  onClick={() => setType("income")}
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
    background: "#eef0f7",
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
    borderRadius: "14px",
    border: "1px solid #e2e6f0",
    padding: "26px 28px",
  },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "0.82rem", fontWeight: "600", color: "#1a1a2e" },
  input: {
    padding: "11px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontFamily: "'Inter',sans-serif",
    color: "#1a1a2e",
    background: "#f9fafb",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontFamily: "'Inter',sans-serif",
    color: "#1a1a2e",
    background: "#f9fafb",
    cursor: "pointer",
    outline: "none",
  },
};

export default AddExpense;
