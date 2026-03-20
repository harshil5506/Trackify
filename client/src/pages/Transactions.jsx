import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Transactions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await API.get("/api/expenses");
      // Backend returns array directly, not { expenses: [] }
      const list = Array.isArray(data) ? data : [];
      setTransactions(list);

      // Calculate stats from the data itself
      const totalIncome = list
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const totalExpense = list
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

      setStats({
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      });
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await API.delete(`/api/expenses/${id}`);
      toast.success("Deleted!");
      fetchTransactions();
    } catch (err) {
      toast.error("Failed");
    }
  };

  const sorted = [...transactions].sort((a, b) => {
    if (sortBy === "date") return new Date(b.date) - new Date(a.date);
    if (sortBy === "amount") return b.amount - a.amount;
    return (a.note || "").localeCompare(b.note || "");
  });

  const catIcons = {
    Food: "☕",
    Transportation: "🚗",
    Shopping: "🛍️",
    Entertainment: "🎬",
    "Bills & Utilities": "⚡",
    Healthcare: "💊",
    Salary: "🏢",
    Freelance: "💻",
    Investment: "📈",
    Other: "💰",
  };

  return (
    <div style={s.appBody}>
      <main style={s.dashMain}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <h1 style={s.pageTitle}>Transaction History</h1>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
              Track and manage all your financial transactions
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={s.filterBtn}>⚙️ Filters</button>
            <button style={s.filterBtn}>📤 Export</button>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "16px",
          }}
        >
          {[
            {
              label: "Total Income",
              value: stats.totalIncome,
              icon: "🪙",
              green: false,
            },
            {
              label: "Total Expenses",
              value: stats.totalExpense,
              icon: "🧾",
              green: false,
            },
            {
              label: "Net Balance",
              value: stats.netBalance,
              icon: "👛",
              green: true,
            },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                borderRadius: "14px",
                padding: "20px 22px",
                position: "relative",
                background: "linear-gradient(135deg,#1a2ea8,#2a3fb0)",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.72)",
                  marginBottom: "6px",
                }}
              >
                {c.label}
              </p>
              <div
                style={{
                  position: "absolute",
                  top: "18px",
                  right: "18px",
                  width: "36px",
                  height: "36px",
                  background: "rgba(255,255,255,0.14)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                {c.icon}
              </div>
              <p
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.55rem",
                  fontWeight: "700",
                  color: c.green ? "#4ade80" : "white",
                }}
              >
                ₹{c.value.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div style={s.dashCard}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <h3 style={s.dashCardTitle}>All Transactions</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.78rem", color: "#666" }}>
                Sort by:
              </span>
              {["date", "amount", "merchant"].map((k) => (
                <button
                  key={k}
                  onClick={() => setSortBy(k)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e2e6f0",
                    fontSize: "0.78rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    background: sortBy === k ? "#1a2ea8" : "white",
                    color: sortBy === k ? "white" : "#666",
                  }}
                >
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              Loading...
            </p>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#666", marginBottom: "12px" }}>
                No transactions yet
              </p>
              <Link
                to="/add-expense"
                style={{
                  background: "#1a2ea8",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Add first transaction
              </Link>
            </div>
          ) : (
            sorted.map((txn) => (
              <div
                key={txn._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "13px 0",
                  borderBottom: "1px solid #f0f2f8",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "18px",
                    background: txn.type === "income" ? "#dcfce7" : "#fee2e2",
                  }}
                >
                  {catIcons[txn.category] || "💰"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "3px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: "600",
                        color: "#1a1a2e",
                      }}
                    >
                      {txn.note || txn.category}
                    </p>
                    <span
                      style={{
                        fontSize: "0.64rem",
                        fontWeight: "700",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background:
                          txn.type === "income" ? "#dcfce7" : "#fee2e2",
                        color: txn.type === "income" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {txn.type?.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.74rem", color: "#666" }}>
                    {txn.category} •{" "}
                    {new Date(txn.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "'Sora',sans-serif",
                        fontSize: "0.93rem",
                        fontWeight: "700",
                        color: txn.type === "income" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {txn.type === "income" ? "+" : "-"}₹
                      {txn.amount.toFixed(2)}
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "#666",
                        textAlign: "right",
                      }}
                    >
                      {txn.paymentMethod || "Cash"}
                    </p>
                  </div>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onClick={() => handleDelete(txn._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
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
  pageTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.9rem",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #e2e6f0",
    background: "white",
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#1a1a2e",
    cursor: "pointer",
  },
  dashCard: {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e2e6f0",
    padding: "26px 28px",
  },
  dashCardTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a2e",
  },
};

export default Transactions;
