import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, getBalanceTone } from "../utils/finance";

const CATEGORY_COLORS = [
  "#4ade80",
  "#fb923c",
  "#a78bfa",
  "#f87171",
  "#38bdf8",
  "#60a5fa",
  "#facc15",
];

const filterByRange = (list, range) => {
  const now = new Date();
  if (range === "Last 7 Days") {
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    return list.filter((item) => new Date(item.date) >= from);
  }
  if (range === "Last 30 Days") {
    const from = new Date(now);
    from.setDate(now.getDate() - 30);
    return list.filter((item) => new Date(item.date) >= from);
  }
  if (range === "This Month") {
    return list.filter((item) => {
      const date = new Date(item.date);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }
  return list;
};

const Reports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reportType, setReportType] = useState("Monthly");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [exportFormat, setExportFormat] = useState("PDF");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalTransactions: 0,
  });
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [summaryRes, categoryRes, expenseRes] = await Promise.all([
        API.get("/api/analytics/summary"),
        API.get("/api/analytics/by-category"),
        API.get("/api/expenses"),
      ]);

      setSummary({
        totalIncome: summaryRes.data.totalIncome || 0,
        totalExpense: summaryRes.data.totalExpense || 0,
        balance: summaryRes.data.balance || 0,
        totalTransactions: summaryRes.data.totalTransactions || 0,
      });
      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
      setTransactions(Array.isArray(expenseRes.data) ? expenseRes.data : []);
    } catch (err) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(
    () => filterByRange(transactions, dateRange),
    [transactions, dateRange],
  );

  const filteredSummary = useMemo(() => {
    const income = filteredTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = filteredTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      totalTransactions: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const breakdown = useMemo(() => {
    const totalExpense = filteredSummary.totalExpense || 1;
    return categories.map((item, index) => ({
      name: item.category,
      amount: formatCurrency(item.total),
      pct: Number(((item.total / totalExpense) * 100).toFixed(1)),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [categories, filteredSummary.totalExpense]);

  const handleGenerate = async () => {
    if (exportFormat !== "PDF") {
      toast(
        "PDF export is available right now. Other formats can be added next.",
      );
      return;
    }

    setGenerating(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const generatedAt = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      doc.setFontSize(18);
      doc.text("Trackify Financial Report", 40, 48);
      doc.setFontSize(11);
      doc.text(`User: ${user?.name || "User"}`, 40, 70);
      doc.text(`Generated: ${generatedAt}`, 40, 86);
      doc.text(`Report Type: ${reportType}`, 320, 70);
      doc.text(`Date Range: ${dateRange}`, 320, 86);

      autoTable(doc, {
        startY: 106,
        theme: "grid",
        head: [["Metric", "Value"]],
        body: [
          ["Total Income", formatCurrency(filteredSummary.totalIncome)],
          ["Total Expenses", formatCurrency(filteredSummary.totalExpense)],
          ["Net Balance", formatCurrency(filteredSummary.balance)],
          ["Total Transactions", String(filteredSummary.totalTransactions)],
        ],
      });

      const categoryRows = breakdown.map((item) => [
        item.name,
        item.amount,
        `${item.pct}%`,
      ]);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        theme: "striped",
        head: [["Category", "Amount", "Share"]],
        body: categoryRows.length
          ? categoryRows
          : [["No category data", "-", "-"]],
      });

      const transactionRows = filteredTransactions
        .slice(0, 200)
        .map((txn) => [
          new Date(txn.date).toLocaleDateString("en-IN"),
          txn.category,
          txn.type,
          formatCurrency(txn.amount),
          txn.note || txn.title || "-",
        ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        theme: "grid",
        head: [["Date", "Category", "Type", "Amount", "Note"]],
        body: transactionRows.length
          ? transactionRows
          : [["-", "-", "-", "-", "No transactions"]],
      });

      doc.save(`trackify-report-${Date.now()}.pdf`);
      toast.success("Report downloaded!");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={s.appBody}>
      <main
        style={{
          maxWidth: "1060px",
          margin: "0 auto",
          padding: "28px 28px 60px",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "20px",
        }}
      >
        <div
          style={{
            flex: 1.45,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            minWidth: 0,
          }}
        >
          <div style={s.dashCard}>
            <h3
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1rem",
                fontWeight: "700",
                color: "#1a1a2e",
                marginBottom: "18px",
              }}
            >
              Report Configuration
            </h3>
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                Date Range
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["Last 7 Days", "Last 30 Days", "This Month", "All Time"].map(
                  (range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      style={{
                        padding: "7px 14px",
                        border: "1px solid #e2e6f0",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        background: dateRange === range ? "#1a2ea8" : "white",
                        color: dateRange === range ? "white" : "#1a1a2e",
                      }}
                    >
                      {range}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                Report Type
              </p>
              <div
                style={{
                  display: "flex",
                  border: "1px solid #e2e6f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  width: "fit-content",
                }}
              >
                {["Daily", "Monthly", "Annual"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setReportType(t)}
                    style={{
                      padding: "7px 18px",
                      border: "none",
                      fontSize: "0.83rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      background: reportType === t ? "#1a2ea8" : "white",
                      color: reportType === t ? "white" : "#666",
                      borderRight: "1px solid #e2e6f0",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                Export Format
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["PDF", "Excel", "CSV", "JSON"].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 16px",
                      border: "1px solid #e2e6f0",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      background: exportFormat === fmt ? "#1a2ea8" : "white",
                      color: exportFormat === fmt ? "white" : "#1a1a2e",
                    }}
                  >
                    {fmt === "PDF"
                      ? "📄"
                      : fmt === "Excel"
                        ? "📊"
                        : fmt === "CSV"
                          ? "📝"
                          : "💻"}{" "}
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={s.dashCard}>
            <h3
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1rem",
                fontWeight: "700",
                color: "#1a1a2e",
                marginBottom: "18px",
              }}
            >
              Expense Breakdown
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {breakdown.map((item) => (
                <div key={item.name}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: item.color,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.86rem",
                          fontWeight: "600",
                          color: "#1a1a2e",
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.86rem",
                        fontWeight: "600",
                        color: "#1a1a2e",
                      }}
                    >
                      {item.amount}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: "5px",
                        background: "#e5e7eb",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "3px",
                          width: `${item.pct}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#666",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            minWidth: 0,
          }}
        >
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
              Export Summary
            </h3>
            {[
              { l: "Report Type", v: reportType },
              { l: "Date Range", v: dateRange },
              { l: "Format", v: exportFormat },
            ].map((row) => (
              <div
                key={row.l}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f2f8",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "#666" }}>
                  {row.l}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}
                >
                  {row.v}
                </span>
              </div>
            ))}
            <div
              style={{
                background: "#1a2ea8",
                borderRadius: "10px",
                padding: "14px 16px",
                margin: "14px 0",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: "4px",
                }}
              >
                Net Balance
              </p>
              <p
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: getBalanceTone(filteredSummary.balance).color,
                }}
              >
                {formatCurrency(filteredSummary.balance)}
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                width: "100%",
                padding: "11px",
                background: "#1a2ea8",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontFamily: "'Sora',sans-serif",
                fontSize: "0.88rem",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "12px",
              }}
            >
              ⬇️ {generating ? "Generating..." : "Generate & Export"}
            </button>
            <div
              style={{
                display: "flex",
                gap: "10px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                padding: "11px 12px",
              }}
            >
              <span style={{ flexShrink: 0 }}>ℹ️</span>
              <p
                style={{
                  fontSize: "0.76rem",
                  color: "#92400e",
                  lineHeight: 1.5,
                }}
              >
                Reports are generated in real-time and may take a few moments.
              </p>
            </div>
          </div>
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
              Quick Stats
            </h3>
            {[
              {
                icon: "🔄",
                label: "Transactions",
                value: String(filteredSummary.totalTransactions),
                color: "#16a34a",
              },
              {
                icon: "📈",
                label: "Total Income",
                value: formatCurrency(filteredSummary.totalIncome),
                color: "#ea580c",
              },
              {
                icon: "⬆️",
                label: "Total Expenses",
                value: formatCurrency(filteredSummary.totalExpense),
                color: "#7c3aed",
              },
            ].map((qs) => (
              <div
                key={qs.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "#f7f8fc",
                  borderRadius: "10px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "16px",
                    background: qs.color,
                  }}
                >
                  {qs.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.73rem",
                      color: "#666",
                      marginBottom: "2px",
                    }}
                  >
                    {qs.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "0.96rem",
                      fontWeight: "700",
                      color: "#1a1a2e",
                    }}
                  >
                    {qs.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div style={s.dashCard}>
            <h3
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1rem",
                fontWeight: "700",
                color: "#1a1a2e",
                marginBottom: "14px",
              }}
            >
              Transactions Preview
            </h3>
            {loading ? (
              <p style={{ fontSize: "0.84rem", color: "#666" }}>
                Loading transactions...
              </p>
            ) : filteredTransactions.length === 0 ? (
              <p style={{ fontSize: "0.84rem", color: "#666" }}>
                No transactions found for this range.
              </p>
            ) : (
              <div style={{ maxHeight: "280px", overflow: "auto" }}>
                {filteredTransactions.slice(0, 10).map((txn) => (
                  <div
                    key={txn._id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "110px 1fr 100px",
                      gap: "10px",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid #edf0f6",
                    }}
                  >
                    <span style={{ fontSize: "0.76rem", color: "#666" }}>
                      {new Date(txn.date).toLocaleDateString("en-IN")}
                    </span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "#1a1a2e",
                        fontWeight: 600,
                      }}
                    >
                      {txn.note || txn.title || txn.category}
                    </span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: txn.type === "income" ? "#16a34a" : "#dc2626",
                        textAlign: "right",
                      }}
                    >
                      {txn.type === "income" ? "+" : "-"}
                      {formatCurrency(txn.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
  dashCard: {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e2e6f0",
    padding: "26px 28px",
  },
};

export default Reports;
