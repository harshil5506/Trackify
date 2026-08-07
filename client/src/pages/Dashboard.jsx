import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency, getBalanceTone } from "../utils/finance";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { formatMoney } = useCurrency();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [expRes, anaRes, catRes, budRes] = await Promise.all([
        API.get("/api/expenses"),
        API.get("/api/analytics/summary"),
        API.get("/api/analytics/by-category"),
        API.get("/api/budget"),
      ]);

      const list = Array.isArray(expRes.data) ? expRes.data : [];
      setTransactions(list.slice(0, 5));

      setStats({
        totalIncome: anaRes.data.totalIncome || 0,
        totalExpense: anaRes.data.totalExpense || 0,
        netBalance: anaRes.data.balance || 0,
      });

      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setBudgets(Array.isArray(budRes.data) ? budRes.data : []);
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

  // Calculate metrics
  const savings = stats.totalIncome - stats.totalExpense;
  const savingsRate = stats.totalIncome
    ? ((savings / stats.totalIncome) * 100).toFixed(1)
    : 0;
  const avgTransaction =
    transactions.length > 0
      ? (
          transactions.reduce((sum, t) => sum + t.amount, 0) /
          transactions.length
        ).toFixed(2)
      : 0;

  const overBudgetCount = budgets.filter(
    (b) => (b.spent || 0) > b.limit,
  ).length;
  const budgetUsagePercent = budgets.length
    ? (
        (budgets.reduce((s, b) => s + (b.spent || 0), 0) /
          budgets.reduce((s, b) => s + b.limit, 0)) *
        100
      ).toFixed(1)
    : 0;

  // Chart data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    const income = transactions
      .filter(
        (t) =>
          t.type === "income" &&
          new Date(t.date).getMonth() === d.getMonth() &&
          new Date(t.date).getFullYear() === d.getFullYear(),
      )
      .reduce((s, t) => s + t.amount, 0);
    const expense = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.date).getMonth() === d.getMonth() &&
          new Date(t.date).getFullYear() === d.getFullYear(),
      )
      .reduce((s, t) => s + t.amount, 0);
    monthlyData.push({ month, income, expense });
  }

  const categoryChartData = categories.slice(0, 5).map((c) => ({
    name: c.category,
    value: c.total,
  }));

  const COLORS = ["#2d47c9", "#fb923c", "#10b981", "#f43f5e", "#f59e0b"];

  return (
    <div style={s.appBody}>
      <main style={s.dashMain}>
        {/* Header */}
        <div>
          <h1 style={s.pageTitle}>💼 Financial Dashboard</h1>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>
            Welcome back! Here's your financial overview
          </p>
        </div>

        {/* Primary Stats */}
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
              bg: "linear-gradient(135deg,#ef4444,#f43f5e)",
              icon: "📉",
            },
            {
              label: "Net Balance",
              value: stats.netBalance,
              bg: "linear-gradient(135deg,#10b981,#14b8a6)",
              icon: "👛",
              isBalance: true,
            },
          ].map((c) => {
            const balanceTone = c.isBalance ? getBalanceTone(c.value) : null;
            return (
              <div key={c.label} style={{ ...s.statCard, background: c.bg }}>
                <div style={s.statIcon}>{c.icon}</div>
                <div>
                  <p style={s.statLabel}>{c.label}</p>
                  <p
                    style={{
                      ...s.statAmount,
                      color: c.isBalance ? balanceTone.color : "white",
                    }}
                  >
                    {formatMoney(c.value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div style={s.analyticsCard}>
            <div style={{ ...s.cardIconCircle, background: "#dbeafe" }}>💰</div>
            <p style={s.analyticsLabel}>Monthly Savings</p>
            <p style={s.analyticsValue}>{formatMoney(savings)}</p>
            <p style={s.analyticsSubtext}>{savingsRate}% of income saved</p>
          </div>

          <div style={s.analyticsCard}>
            <div style={{ ...s.cardIconCircle, background: "#fef3c7" }}>📊</div>
            <p style={s.analyticsLabel}>Budget Usage</p>
            <p style={s.analyticsValue}>{budgetUsagePercent}%</p>
            <p style={s.analyticsSubtext}>
              {budgets.length} budget{budgets.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div style={s.analyticsCard}>
            <div style={{ ...s.cardIconCircle, background: "#f3e8ff" }}>🎯</div>
            <p style={s.analyticsLabel}>Avg. Transaction</p>
            <p style={s.analyticsValue}>{formatMoney(avgTransaction)}</p>
            <p style={s.analyticsSubtext}>{transactions.length} recent</p>
          </div>

          {overBudgetCount > 0 && (
            <div
              style={{
                ...s.analyticsCard,
                background: "#fee2e2",
                border: "1.5px solid #fecaca",
              }}
            >
              <div style={{ ...s.cardIconCircle, background: "#fecaca" }}>
                ⚠️
              </div>
              <p style={s.analyticsLabel}>Budget Alert</p>
              <p style={{ ...s.analyticsValue, color: "#dc2626" }}>
                {overBudgetCount} over
              </p>
              <p style={s.analyticsSubtext}>Review spending</p>
            </div>
          )}
        </div>

        {/* Charts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div style={s.dashCard}>
            <h3 style={s.dashCardTitle}>Income vs Expense Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e6f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    background: "#1a2ea8",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={s.dashCard}>
            <h3 style={s.dashCardTitle}>Spending by Category</h3>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name} ${formatCurrency(value)}`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      background: "#1a2ea8",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ color: "#999" }}>No expense data</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Transaction */}
        <div style={s.dashCard}>
          <h3 style={s.dashCardTitle}>➕ Add New Transaction</h3>
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

        {/* Recent Transactions */}
        <div style={s.dashCard}>
          <div style={s.cardHeader}>
            <h3 style={s.dashCardTitle}>
              Recent Transactions{" "}
              <span style={{ color: "#666", fontWeight: "400" }}>
                ({transactions.length})
              </span>
            </h3>
            <Link to="/transactions" style={s.viewAllBtn}>
              View All →
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
                      {txn.type === "income" ? "+" : "-"}{formatMoney(txn.amount)}
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
  pageTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.9rem",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  dashMain: {
    maxWidth: "1200px",
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
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  statIcon: { fontSize: "28px" },
  statLabel: { fontSize: "0.84rem", opacity: 0.84, marginBottom: "4px" },
  statAmount: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.4rem",
    fontWeight: "700",
  },
  analyticsCard: {
    background: "white",
    borderRadius: "12px",
    border: "1.5px solid #e2e6f0",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardIconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "12px",
  },
  analyticsLabel: {
    fontSize: "0.82rem",
    color: "#666",
    marginBottom: "6px",
    fontWeight: "500",
  },
  analyticsValue: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  analyticsSubtext: {
    fontSize: "0.75rem",
    color: "#999",
  },
  dashCard: {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e2e6f0",
    padding: "26px 28px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
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
    transition: "all 0.3s ease",
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
