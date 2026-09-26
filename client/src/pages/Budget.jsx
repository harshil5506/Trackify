import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/finance";

const CATEGORIES = [
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

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const Budget = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [form, setForm] = useState({
    category: "Food",
    limit: "",
    month: getCurrentMonth(),
  });

  const fetchBudgets = async (monthValue = selectedMonth) => {
    setLoading(true);
    try {
      const { data } = await API.get("/api/budget", {
        params: { month: monthValue },
      });
      setBudgets(data);
    } catch (err) {
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets(selectedMonth);
  }, [selectedMonth]);

  const handleSubmit = async () => {
    const numericLimit = Number(form.limit);
    if (!form.category) return toast.error("Please select a category");
    if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
      return toast.error("Please enter a valid limit greater than 0");
    }

    setSaving(true);
    try {
      const payload = {
        category: form.category,
        limit: numericLimit,
        month: form.month || selectedMonth,
      };

      if (editingBudgetId) {
        await API.put(`/api/budget/${editingBudgetId}`, payload);
        toast.success("Budget updated!");
      } else {
        await API.post("/api/budget", payload);
        toast.success("Budget set!");
      }

      setShowForm(false);
      setEditingBudgetId(null);
      setForm({ category: "Food", limit: "", month: selectedMonth });
      fetchBudgets(selectedMonth);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (budget) => {
    setEditingBudgetId(budget._id);
    setForm({
      category: budget.category,
      limit: String(budget.limit || ""),
      month: budget.month || selectedMonth,
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingBudgetId(null);
    setShowForm(false);
    setForm({ category: "Food", limit: "", month: selectedMonth });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await API.delete(`/api/budget/${id}`);
      toast.success("Removed");
      fetchBudgets(selectedMonth);
    } catch (err) {
      toast.error("Failed");
    }
  };

  const getBarColor = (spent, limit) => {
    const p = (spent / limit) * 100;
    return p >= 100 ? "#dc2626" : p >= 80 ? "#d97706" : "#16a34a";
  };
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  const monthLabel = new Date(
    `${selectedMonth}-01T00:00:00`,
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={s.appBody}>
      <main style={s.dashMain}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={s.pageTitle}>Budget Planner</h1>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
              Set and track your monthly spending limits for {monthLabel}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setForm((prev) => ({ ...prev, month: e.target.value }));
              }}
              style={{
                padding: "10px 12px",
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "0.86rem",
                background: "white",
              }}
            />
            <button
              style={s.addBtn}
              onClick={() => (showForm ? cancelEdit() : setShowForm(true))}
            >
              {showForm ? "✕ Cancel" : "+ Set Budget"}
            </button>
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
              label: "Total Budget",
              value: totalBudget,
              color: "#1a2ea8",
              icon: "🎯",
            },
            {
              label: "Total Spent",
              value: totalSpent,
              color: "#dc2626",
              icon: "💸",
            },
            {
              label: "Remaining",
              value: totalRemaining,
              color: totalRemaining < 0 ? "#dc2626" : "#16a34a",
              icon: "💰",
            },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                borderRadius: "14px",
                padding: "22px 24px",
                color: "white",
                background: `linear-gradient(135deg,${c.color},${c.color}dd)`,
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                {c.icon}
              </div>
              <p
                style={{
                  fontSize: "0.84rem",
                  opacity: 0.84,
                  marginBottom: "4px",
                }}
              >
                {c.label}
              </p>
              <p
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  color:
                    c.label === "Remaining" && c.value < 0
                      ? "#fecaca"
                      : "white",
                }}
              >
                {formatCurrency(c.value)}
              </p>
            </div>
          ))}
        </div>
        {showForm && (
          <div style={s.dashCard}>
            <h3
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1rem",
                fontWeight: "700",
                color: "#1a1a2e",
                marginBottom: "16px",
              }}
            >
              Set Monthly Budget
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: "16px",
                alignItems: "end",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}
                >
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  style={s.formInput}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}
                >
                  Month
                </label>
                <input
                  type="month"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                  style={s.formInput}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}
                >
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  style={s.formInput}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  padding: "11px 24px",
                  background: "#1a2ea8",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : editingBudgetId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        )}
        <div style={s.dashCard}>
          <h3
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1rem",
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: "20px",
            }}
          >
            Monthly Budgets
          </h3>
          {loading ? (
            <p style={{ color: "#666", textAlign: "center", padding: "40px" }}>
              Loading...
            </p>
          ) : budgets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ fontSize: "48px", marginBottom: "12px" }}>🎯</p>
              <p
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: "8px",
                }}
              >
                No budgets set yet
              </p>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "#666",
                  marginBottom: "20px",
                }}
              >
                Click "Set Budget" to start tracking
              </p>
              <button onClick={() => setShowForm(true)} style={s.addBtn}>
                Set Your First Budget
              </button>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {budgets.map((b) => {
                const pct = Math.min(
                  100,
                  Math.round(((b.spent || 0) / b.limit) * 100),
                );
                const barColor = getBarColor(b.spent || 0, b.limit);
                return (
                  <div
                    key={b._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px",
                      background: "#f7f8fc",
                      borderRadius: "12px",
                      border: "1px solid #e2e6f0",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Sora',sans-serif",
                            fontSize: "0.95rem",
                            fontWeight: "700",
                            color: "#1a1a2e",
                          }}
                        >
                          {b.category}
                        </span>
                        {(b.spent || 0) > b.limit && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "600",
                              padding: "2px 8px",
                              borderRadius: "20px",
                              background: "#fee2e2",
                              color: "#dc2626",
                            }}
                          >
                            Over budget!
                          </span>
                        )}
                        {pct >= 80 && (b.spent || 0) <= b.limit && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "600",
                              padding: "2px 8px",
                              borderRadius: "20px",
                              background: "#fef3c7",
                              color: "#92400e",
                            }}
                          >
                            ⚠️ 80%+
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: "600",
                            color: "#1a1a2e",
                          }}
                        >
                          {formatCurrency(b.spent || 0)} spent
                        </span>
                        <span style={{ fontSize: "0.82rem", color: "#666" }}>
                          of {formatCurrency(b.limit)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color:
                              (b.remaining || 0) < 0 ? "#dc2626" : "#16a34a",
                            fontWeight: "600",
                          }}
                        >
                          Remaining: {formatCurrency(b.remaining || 0)}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "8px",
                          background: "#e5e7eb",
                          borderRadius: "4px",
                          overflow: "hidden",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: "4px",
                            width: `${pct}%`,
                            background: barColor,
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#666" }}>
                        {pct}% used
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() => startEdit(b)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                        title="Edit budget"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                        title="Delete budget"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
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
  pageTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.9rem",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  addBtn: {
    background: "#1a2ea8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "0.88rem",
    fontWeight: "600",
    fontFamily: "'Sora',sans-serif",
    cursor: "pointer",
  },
  dashCard: {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e2e6f0",
    padding: "26px 28px",
  },
  formInput: {
    padding: "11px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontFamily: "'Inter',sans-serif",
    color: "#1a1a2e",
    background: "#f9fafb",
    outline: "none",
    width: "100%",
  },
};

export default Budget;
