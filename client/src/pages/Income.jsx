import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/finance";
import { downloadCSV, formatToCSV } from "../utils/csvExport";

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

const Income = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "Business",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const { data } = await API.get("/api/expenses?type=income");
      const list = Array.isArray(data) ? data : (data.expenses || []);
      setIncomes(list);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.amount) return toast.error("Amount is required");
    try {
      await API.post("/api/expenses", {
        ...form,
        amount: parseFloat(form.amount),
        type: "income",
      });
      toast.success("Income added!");
      setShowForm(false);
      setForm({
        amount: "",
        category: "Business",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchIncomes();
    } catch (err) {
      toast.error("Failed to add income");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/expenses/${id}`);
      toast.success("Deleted!");
      fetchIncomes();
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleExportCSV = () => {
    if (incomes.length === 0) {
      toast.error("No income records to export");
      return;
    }
    const headers = ["Date", "Category", "Amount (₹)", "Note"];
    const rows = incomes.map((item) => [
      new Date(item.date).toLocaleDateString("en-IN"),
      item.category || "-",
      item.amount || 0,
      item.note || "-",
    ]);
    const csvContent = formatToCSV(headers, rows);
    downloadCSV(`income-records-${Date.now()}.csv`, csvContent);
    toast.success("Income CSV exported successfully!");
  };

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

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
            <h1 style={s.pageTitle}>Income</h1>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
              Track all your income sources
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{ ...s.addBtn, background: "#0284c7" }}
              onClick={handleExportCSV}
            >
              📝 Export CSV
            </button>
            <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? "✕ Cancel" : "+ Add Income"}
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
              label: "Total Income",
              value: totalIncome,
              icon: "💰",
              color: "#16a34a",
            },
            {
              label: "This Month",
              value: incomes
                .filter(
                  (i) => new Date(i.date).getMonth() === new Date().getMonth(),
                )
                .reduce((s, i) => s + i.amount, 0),
              icon: "📅",
              color: "#1a2ea8",
            },
            {
              label: "Sources",
              value: incomes.length,
              icon: "📊",
              color: "#7c3aed",
              isCount: true,
            },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                borderRadius: "14px",
                padding: "22px 24px",
                color: "white",
                background: `linear-gradient(135deg,${c.color},${c.color}cc)`,
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
                }}
              >
                {c.isCount ? c.value : `₹${c.value.toFixed(2)}`}
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
              Add Income
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                    }}
                  >
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    style={s.formInput}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    Income Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    style={s.formInput}
                  >
                    {INCOME_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                    }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={s.formInput}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                    }}
                  >
                    Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly salary"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    style={s.formInput}
                  />
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
                  onClick={() => setShowForm(false)}
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
                <button onClick={handleSubmit} style={s.addBtn}>
                  Add Income
                </button>
              </div>
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
            Income History
          </h3>
          {loading ? (
            <p style={{ color: "#666", textAlign: "center", padding: "40px" }}>
              Loading...
            </p>
          ) : incomes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ fontSize: "48px", marginBottom: "12px" }}>💰</p>
              <p
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: "8px",
                }}
              >
                No income recorded yet
              </p>
              <button onClick={() => setShowForm(true)} style={s.addBtn}>
                Add Your First Income
              </button>
            </div>
          ) : (
            incomes.map((inc) => (
              <div
                key={inc._id}
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
                    background: "#dcfce7",
                  }}
                >
                  💰
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                      marginBottom: "3px",
                    }}
                  >
                    {inc.note || inc.category}
                  </p>
                  <p style={{ fontSize: "0.74rem", color: "#666" }}>
                    {inc.category} •{" "}
                    {new Date(inc.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <p
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "0.93rem",
                      fontWeight: "700",
                      color: "#16a34a",
                    }}
                  >
                    +₹{inc.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleDelete(inc._id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
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
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
    padding: "28px",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  },
  formInput: {
    padding: "13px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontSize: "0.92rem",
    fontFamily: "'Inter',sans-serif",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none",
    width: "100%",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
  },
};

export default Income;
