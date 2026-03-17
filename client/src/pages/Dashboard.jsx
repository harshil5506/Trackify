import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [expRes, anaRes] = await Promise.all([
        API.get("/api/expenses"),
        API.get("/api/analytics/summary"),
      ]);

      // Backend returns array directly
      const list = Array.isArray(expRes.data) ? expRes.data : [];
      // Show only latest 5
      setTransactions(list.slice(0, 5));

      setStats({
        totalIncome: anaRes.data.totalIncome || 0,
        totalExpense: anaRes.data.totalExpense || 0,
        // Backend returns 'balance', not 'netBalance'
        netBalance: anaRes.data.balance || 0,
      });
    } catch (err) {
      toast.error("Failed to load dashboard");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/expenses/${id}`);
      toast.success("Deleted!");
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed");
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
            <Link to="/dashboard" style={{ ...s.appNavLink, color: "white" }}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/add-expense" style={s.appNavLink}>
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
        <div style={s.dashStats}>
          {[
            {
              label: "Total Income",
              value: stats.totalIncome,
              bg: "linear-gradient(135deg,#1a2ea8,#2d47c9)",
              icon: "📈",
            },
            {
              label: "Total Expense",
              value: stats.totalExpense,
              bg: "linear-gradient(135deg,#2d47c9,#4a6cf7)",
              icon: "📉",
            },
            {
              label: "Net Balance",
              value: stats.netBalance,
              bg: "linear-gradient(135deg,#1e3ab5,#2d47c9)",
              icon: "👛",
              green: true,
            },
          ].map((c) => (
            <div key={c.label} style={{ ...s.statCard, background: c.bg }}>
              <div style={s.statIcon}>{c.icon}</div>
              <div>
                <p style={s.statLabel}>{c.label}</p>
                <p
                  style={{
                    ...s.statAmount,
                    color: c.green ? "#4ade80" : "white",
                  }}
                >
                  ₹{c.value.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={s.dashCard}>
          <h3 style={s.dashCardTitle}>Add New Transaction</h3>
          <div style={s.inputMethods}>
            {[
              {
                bg: "#e3ebff",
                ibg: "#1a2ea8",
                icon: "🎤",
                label: "Voice Input",
                sub: "Speak to add",
                lc: "#1a2ea8",
                sc: "#4a6cf7",
              },
              {
                bg: "#d6f5e8",
                ibg: "#0d7a68",
                icon: "📝",
                label: "Text Input",
                sub: "Type details",
                lc: "#0d7a68",
                sc: "#0d9488",
              },
              {
                bg: "#fdf3d0",
                ibg: "#7c3000",
                icon: "📷",
                label: "Scan Receipt",
                sub: "Upload receipt",
                lc: "#7c3000",
                sc: "#b45309",
              },
            ].map((m) => (
              <Link
                key={m.label}
                to="/add-expense"
                style={{
                  ...s.inputMethod,
                  background: m.bg,
                  textDecoration: "none",
                }}
              >
                <div style={{ ...s.inputMethodIcon, background: m.ibg }}>
                  {m.icon}
                </div>
                <p style={{ ...s.imLabel, color: m.lc }}>{m.label}</p>
                <p style={{ ...s.imSub, color: m.sc }}>{m.sub}</p>
              </Link>
            ))}
          </div>
        </div>
        <div style={s.dashCard}>
          <div style={s.cardHeader}>
            <h3 style={s.dashCardTitle}>
              Recent Transactions{" "}
              <span style={{ color: "#666", fontWeight: "400" }}>
                ({transactions.length})
              </span>
            </h3>
            <Link to="/transactions" style={s.viewAllBtn}>
              View All
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "#666", marginBottom: "12px" }}>
                No transactions yet
              </p>
              <Link to="/add-expense" style={{ ...s.viewAllBtn }}>
                Add your first transaction
              </Link>
            </div>
          ) : (
            <div>
              {transactions.map((txn) => (
                <div key={txn._id} style={s.txnRow}>
                  <div style={{ flex: 1 }}>
                    <p style={s.txnName}>{txn.note || txn.category}</p>
                    <div style={s.txnMeta}>
                      <span
                        style={{
                          ...s.txnBadge,
                          background:
                            txn.type === "income" ? "#dcfce7" : "#fee2e2",
                          color: txn.type === "income" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {txn.type === "income" ? "Income" : "Expense"}
                      </span>
                      <span style={s.txnDate}>
                        📅 {new Date(txn.date).toLocaleDateString()}
                      </span>
                      <span style={s.txnCat}>{txn.category}</span>
                    </div>
                  </div>
                  <div style={s.txnRight}>
                    <span
                      style={{
                        ...s.txnAmount,
                        color: txn.type === "income" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {txn.type === "income" ? "+" : "-"}₹
                      {txn.amount.toFixed(2)}
                    </span>
                    <button
                      style={s.txnDel}
                      onClick={() => handleDelete(txn._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
  dashStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "16px",
  },
  statCard: {
    borderRadius: "14px",
    padding: "22px 24px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    color: "white",
  },
  statIcon: { fontSize: "28px" },
  statLabel: { fontSize: "0.84rem", opacity: 0.84, marginBottom: "4px" },
  statAmount: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.4rem",
    fontWeight: "700",
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
    marginBottom: "16px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  viewAllBtn: {
    background: "#1a2ea8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 18px",
    fontSize: "0.82rem",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Sora',sans-serif",
    textDecoration: "none",
  },
  inputMethods: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "16px",
  },
  inputMethod: {
    borderRadius: "12px",
    padding: "30px 20px",
    textAlign: "center",
    cursor: "pointer",
    border: "2px solid transparent",
    display: "block",
  },
  inputMethodIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
    fontSize: "24px",
  },
  imLabel: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "0.92rem",
    fontWeight: "700",
    marginBottom: "5px",
  },
  imSub: { fontSize: "0.77rem" },
  txnRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 14px",
    borderRadius: "10px",
    background: "#f8f9fc",
    marginBottom: "8px",
  },
  txnName: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "5px",
  },
  txnMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  txnBadge: {
    fontSize: "0.68rem",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  txnDate: { fontSize: "0.75rem", color: "#666" },
  txnCat: { fontSize: "0.75rem", color: "#2d47c9" },
  txnRight: { display: "flex", alignItems: "center", gap: "10px" },
  txnAmount: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "0.93rem",
    fontWeight: "700",
  },
  txnDel: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Dashboard;
