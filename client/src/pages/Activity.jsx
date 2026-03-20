import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Activity = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 6200,
    totalExpense: 2455,
    balance: 3745,
    budgetUsed: 2455,
    budgetTotal: 5000,
  });

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const [expRes, anaRes] = await Promise.all([
        API.get("/api/expenses?limit=5"),
        API.get("/api/analytics/summary"),
      ]);
      if (expRes.data.expenses?.length > 0) {
        setTransactions(
          expRes.data.expenses.map((t) => ({
            id: t._id,
            name: t.note || t.category,
            meta: `${t.category} · ${new Date(t.date).toLocaleDateString()}`,
            amount: `${t.type === "income" ? "+" : "-"}₹${t.amount.toFixed(2)}`,
            type: t.type,
          })),
        );
      }
      if (anaRes.data)
        setStats({
          totalIncome: anaRes.data.totalIncome || 0,
          totalExpense: anaRes.data.totalExpense || 0,
          balance: anaRes.data.netBalance || 0,
          budgetUsed: anaRes.data.totalExpense || 0,
          budgetTotal: 5000,
        });
    } catch (err) {}
  };

  const budgetPct = Math.round((stats.budgetUsed / stats.budgetTotal) * 100);

  return (
    <div style={s.appBody}>
      <main
        style={{
          maxWidth: "1060px",
          margin: "0 auto",
          padding: "32px 28px 60px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "2rem",
              fontWeight: "800",
              color: "#1a1a2e",
              marginBottom: "4px",
            }}
          >
            Activity Summary
          </h1>
          <p style={{ fontSize: "0.84rem", color: "#666" }}>
            Your financial overview at a glance
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "14px",
          }}
        >
          {[
            {
              icon: "⬆️",
              bg: "#1a2ea8",
              label: "Total Income",
              value: `₹${stats.totalIncome.toLocaleString()}`,
              pill: "+12.5%",
              pillBg: "#dcfce7",
              pillColor: "#16a34a",
            },
            {
              icon: "💳",
              bg: "#dc2626",
              label: "Total Expense",
              value: `₹${stats.totalExpense.toLocaleString()}`,
              pill: "-8.3%",
              pillBg: "#fee2e2",
              pillColor: "#dc2626",
            },
            {
              icon: "🔄",
              bg: "#16a34a",
              label: "Current Balance",
              value: `₹${stats.balance.toLocaleString()}`,
              pill: "Active",
              pillBg: "#dbeafe",
              pillColor: "#1d4ed8",
            },
            {
              icon: "📊",
              bg: "#7c3aed",
              label: "Budget Remaining",
              value: `₹${(stats.budgetTotal - stats.budgetUsed).toLocaleString()}`,
              pill: `${budgetPct}%`,
              pillBg: "#f3e8ff",
              pillColor: "#7c3aed",
              hasBar: true,
            },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2e6f0",
                padding: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    background: c.bg,
                  }}
                >
                  {c.icon}
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    padding: "3px 9px",
                    borderRadius: "20px",
                    background: c.pillBg,
                    color: c.pillColor,
                  }}
                >
                  {c.pill}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#666",
                  marginBottom: "5px",
                }}
              >
                {c.label}
              </p>
              <p
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.35rem",
                  fontWeight: "700",
                  color: "#1a1a2e",
                }}
              >
                {c.value}
              </p>
              {c.hasBar && (
                <>
                  <div
                    style={{
                      height: "5px",
                      background: "#e5e7eb",
                      borderRadius: "3px",
                      overflow: "hidden",
                      marginTop: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "#2d47c9",
                        borderRadius: "3px",
                        width: `${budgetPct}%`,
                      }}
                    />
                  </div>
                  <p style={{ fontSize: "0.66rem", color: "#666" }}>
                    ₹{stats.budgetUsed.toLocaleString()} / ₹
                    {stats.budgetTotal.toLocaleString()} used
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            border: "1px solid #e2e6f0",
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: "3px",
                }}
              >
                Recent Transactions
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#666" }}>
                Your last 5 financial activities
              </p>
            </div>
            <Link
              to="/transactions"
              style={{
                background: "#1a2ea8",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                fontFamily: "'Sora',sans-serif",
                fontSize: "0.82rem",
                fontWeight: "600",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              View All
            </Link>
          </div>
          {transactions.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>
              No transactions yet
            </p>
          ) : (
            transactions.map((txn, i) => (
              <div
                key={txn.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "15px 0",
                  borderBottom:
                    i === transactions.length - 1
                      ? "none"
                      : "1px solid #f0f2f8",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: txn.type === "income" ? "#dcfce7" : "#fee2e2",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>
                    {txn.type === "income" ? "⬆️" : "⬇️"}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                      marginBottom: "3px",
                    }}
                  >
                    {txn.name}
                  </p>
                  <p style={{ fontSize: "0.76rem", color: "#666" }}>
                    {txn.meta}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "4px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      color: txn.type === "income" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {txn.amount}
                  </p>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: "600",
                      padding: "2px 10px",
                      borderRadius: "4px",
                      background: txn.type === "income" ? "#dcfce7" : "#fee2e2",
                      color: txn.type === "income" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {txn.type === "income" ? "Income" : "Expense"}
                  </span>
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
};

export default Activity;
