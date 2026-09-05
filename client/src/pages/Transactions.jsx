import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency, getBalanceTone } from "../utils/finance";

const Transactions = () => {
  const { user } = useAuth();
  const { formatMoney, currency: userCurrency, formatNativeAmount } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [recurringIds, setRecurringIds] = useState(new Set());
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // all, income, expense
  const [filterCategory, setFilterCategory] = useState("all");

  // ✅ Edit modal state
  const [editModal, setEditModal] = useState(null); // holds txn object
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await API.get("/api/expenses");
      const list = Array.isArray(data) ? data : [];
      setTransactions(list);

      const totalIncome = list
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + (t.baseAmount != null ? t.baseAmount : t.amount), 0);
      const totalExpense = list
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + (t.baseAmount != null ? t.baseAmount : t.amount), 0);

      setStats({
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      });

      // Load recurring detections to identify recurring transactions
      try {
        const recRes = await API.get("/api/analytics/recurring");
        const allIds = new Set();
        (recRes.data.recurring || []).forEach((r) => {
          (r.transactionIds || []).forEach((id) => allIds.add(id));
        });
        setRecurringIds(allIds);
      } catch (recErr) {
        // silent fallback
      }
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
      toast.error("Failed to delete");
    }
  };

  // ✅ Open edit modal
  const openEdit = (txn) => {
    setEditModal(txn);
    setEditForm({
      title: txn.title || txn.note || "",
      amount: txn.amount,
      category: txn.category,
      date: txn.date ? txn.date.split("T")[0] : "",
      type: txn.type,
      paymentMethod: txn.paymentMethod || "Cash",
      note: txn.note || "",
    });
  };

  // ✅ Save edited transaction
  const categories = [
    "Food",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Rent",
    "Business",
    "Job",
    "Part-Time Job",
    "Stock Market",
    "Freelancing",
    "Investments",
    "Rental Income",
    "Passive Income",
    "Salary",
    "Other",
  ];

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) return toast.error("Title is required");
    if (!editForm.amount || editForm.amount <= 0)
      return toast.error("Enter a valid amount");

    setSaving(true);
    try {
      await API.put(`/api/expenses/${editModal._id}`, {
        title: editForm.title,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: editForm.date,
        type: editForm.type,
        paymentMethod: editForm.paymentMethod,
        note: editForm.note,
      });
      toast.success("Transaction updated! ✅");
      setEditModal(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const sorted = [...transactions]
    .filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category !== filterCategory)
        return false;
      return true;
    })
    .sort((a, b) => {
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
    Education: "🎓",
    Rent: "🏠",
    Business: "🏬",
    Job: "💼",
    "Part-Time Job": "🕒",
    "Stock Market": "📈",
    Freelancing: "💻",
    Investments: "📊",
    "Rental Income": "🏘️",
    "Passive Income": "🪙",
    Salary: "🏢",
    Freelance: "💻",
    Investment: "📈",
    Other: "💰",
  };

  const handleExportCSV = () => {
    if (sorted.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = [
      "Date",
      "Category",
      "Type",
      "Amount",
      "Title/Note",
      "Payment Method",
    ];
    const csvContent = [
      headers.join(","),
      ...sorted.map((txn) =>
        [
          new Date(txn.date).toLocaleDateString("en-IN"),
          txn.category || "-",
          txn.type || "-",
          txn.amount || 0,
          (txn.title || txn.note || "").replace(/"/g, '""'),
          txn.paymentMethod || "Cash",
        ]
          .map((field) =>
            typeof field === "string" && field.includes(",")
              ? `"${field}"`
              : field,
          )
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  };

  const handleExportPDF = async () => {
    if (sorted.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const generatedAt = new Date().toLocaleString("en-IN");

      doc.setFontSize(18);
      doc.text("Transaction Export", 40, 40);
      doc.setFontSize(10);
      doc.text(`Generated: ${generatedAt}`, 40, 60);
      doc.text(`Total Transactions: ${sorted.length}`, 40, 74);

      const tableData = sorted
        .slice(0, 500)
        .map((txn) => [
          new Date(txn.date).toLocaleDateString("en-IN"),
          txn.category,
          txn.type.toUpperCase(),
          txn.currency && txn.currency !== "INR"
            ? `${txn.currency} ${txn.amount.toFixed(2)} (≈ ₹${(txn.baseAmount != null ? txn.baseAmount : txn.amount).toFixed(2)})`
            : `₹${txn.amount.toFixed(2)}`,
          txn.title || txn.note || "-",
          txn.paymentMethod || "Cash",
        ]);

      autoTable(doc, {
        startY: 90,
        theme: "grid",
        head: [
          [
            "Date",
            "Category",
            "Type",
            "Amount",
            "Title/Note",
            "Payment Method",
          ],
        ],
        body: tableData,
      });

      doc.save(`transactions-${Date.now()}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (err) {
      toast.error("Failed to export PDF");
    }
  };

  const paymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "UPI",
  ];

  return (
    <div style={s.appBody}>
      <main style={s.dashMain}>
        {/* Header */}
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
            <button
              onClick={() => {
                // Toggle export menu
                const menu = document.getElementById("exportMenu");
                if (menu) {
                  menu.style.display =
                    menu.style.display === "none" ? "flex" : "none";
                }
              }}
              style={s.filterBtn}
            >
              📤 Export
            </button>
            <div
              id="exportMenu"
              style={{
                display: "none",
                position: "absolute",
                top: "72px",
                right: "20px",
                background: "white",
                border: "1px solid #e2e6f0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 100,
                flexDirection: "column",
              }}
            >
              <button
                onClick={() => {
                  handleExportCSV();
                  document.getElementById("exportMenu").style.display = "none";
                }}
                style={{
                  border: "none",
                  background: "darkblue",
                  padding: "12px 20px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  borderBottom: "1px solid #e2e6f0",
                }}
              >
                📊 CSV Export
              </button>
              <button
                onClick={() => {
                  handleExportPDF();
                  document.getElementById("exportMenu").style.display = "none";
                }}
                style={{
                  border: "none",
                  background: "darkblue",
                  padding: "12px 20px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                📄 PDF Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
            },
            {
              label: "Total Expenses",
              value: stats.totalExpense,
              icon: "🧾",
            },
            {
              label: "Net Balance",
              value: stats.netBalance,
              icon: "👛",
              isBalance: true,
            },
          ].map((c) => {
            const balanceTone = c.isBalance ? getBalanceTone(c.value) : null;

            return (
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
                    color: c.isBalance ? balanceTone.color : "white",
                  }}
                >
                  {formatMoney(c.value)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Transactions List */}
        <div style={s.dashCard}>
          {/* Filters */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {/* Type Filter */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#666" }}>
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1.5px solid #e2e6f0",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#666" }}>
                Filter by Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1.5px solid #e2e6f0",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(filterType !== "all" || filterCategory !== "all") && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setFilterType("all");
                    setFilterCategory("all");
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e6f0",
                    borderRadius: "6px",
                    background: "#f7f8fc",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Sort Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <h3 style={s.dashCardTitle}>All Transactions ({sorted.length})</h3>
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
                {/* Icon */}
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

                {/* Info */}
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
                      {txn.title || txn.note || txn.category}
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
                    {/* Recurring badge */}
                    {recurringIds.has(txn._id) && (
                      <span
                        style={{
                          fontSize: "0.64rem",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "#e0e7ff",
                          color: "#4338ca",
                        }}
                      >
                        🔁 RECURRING
                      </span>
                    )}
                    {/* Source badge */}
                    {txn.source && txn.source !== "personal" && (
                      <span
                        style={{
                          fontSize: "0.64rem",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background:
                            txn.source === "group" ? "#e3ebff" : "#f3e8ff",
                          color: txn.source === "group" ? "#1a2ea8" : "#6b21a8",
                        }}
                      >
                        {txn.source === "group" ? "👥 Group" : "🤝 Friend"}
                      </span>
                    )}
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

                {/* Amount + Actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexShrink: 0,
                  }}
                >
                  <div>
                    {txn.currency && txn.currency !== userCurrency ? (
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            fontFamily: "'Sora',sans-serif",
                            fontSize: "0.93rem",
                            fontWeight: "700",
                            color: txn.type === "income" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {txn.type === "income" ? "+" : "-"}
                          {formatNativeAmount(txn.amount, txn.currency)}
                        </p>
                        <p
                          style={{
                            fontSize: "0.72rem",
                            color: "#6b7280",
                            fontWeight: "500",
                          }}
                        >
                          ≈ {formatMoney(txn.baseAmount != null ? txn.baseAmount : txn.amount)}
                        </p>
                      </div>
                    ) : (
                      <p
                        style={{
                          fontFamily: "'Sora',sans-serif",
                          fontSize: "0.93rem",
                          fontWeight: "700",
                          color: txn.type === "income" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {txn.type === "income" ? "+" : "-"}
                        {formatMoney(txn.baseAmount != null ? txn.baseAmount : txn.amount)}
                      </p>
                    )}
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
                  {/* ✅ Edit button */}
                  <button
                    onClick={() => openEdit(txn)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ✏️
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(txn._id)}
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

      {/* ✅ Edit Modal */}
      {editModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "22px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: "4px",
                  }}
                >
                  ✏️ Edit Transaction
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#666" }}>
                  Update your transaction details
                </p>
              </div>
              <button
                onClick={() => setEditModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Title */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Title / Description</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  style={s.input}
                  placeholder="What was this for?"
                />
              </div>

              {/* Amount */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Amount</label>
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
                      borderRight: "1.5px solid #d1d5db",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount: e.target.value })
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      flex: 1,
                      padding: "10px 14px",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category + Payment Method */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div style={s.fieldGroup}>
                  <label style={s.label}>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    style={s.select}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Payment Method</label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        paymentMethod: e.target.value,
                      })
                    }
                    style={s.select}
                  >
                    {paymentMethods.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                  style={s.input}
                />
              </div>

              {/* Type Toggle */}
              <div style={s.fieldGroup}>
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
                    onClick={() =>
                      setEditForm({ ...editForm, type: "expense" })
                    }
                    style={{
                      padding: "9px 30px",
                      border: "none",
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "0.86rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      background:
                        editForm.type === "expense" ? "#fee2e2" : "white",
                      color: editForm.type === "expense" ? "#dc2626" : "#666",
                    }}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: "income" })}
                    style={{
                      padding: "9px 30px",
                      border: "none",
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "0.86rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      background:
                        editForm.type === "income" ? "#dcfce7" : "white",
                      color: editForm.type === "income" ? "#16a34a" : "#666",
                    }}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Note */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Note (optional)</label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) =>
                    setEditForm({ ...editForm, note: e.target.value })
                  }
                  style={s.input}
                  placeholder="Additional notes..."
                />
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "4px",
                }}
              >
                <button
                  onClick={() => setEditModal(null)}
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
                  onClick={handleSaveEdit}
                  disabled={saving}
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
                  {saving ? "Saving..." : "Save Changes ✅"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  appBody: {
    background: "#eef0f7",
    minHeight: "100vh",
    fontFamily: "'Inter',sans-serif",
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
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#1a1a2e",
  },
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

export default Transactions;
