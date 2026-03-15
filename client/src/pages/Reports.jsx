import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const breakdown = [
  {
    name: "Travel & Transport",
    amount: "₹12,450",
    pct: 27.3,
    color: "#4ade80",
  },
  { name: "Food & Dining", amount: "₹8,920", pct: 19.5, color: "#fb923c" },
  { name: "Office Supplies", amount: "₹6,780", pct: 14.8, color: "#a78bfa" },
  { name: "Utilities", amount: "₹5,430", pct: 11.9, color: "#f87171" },
  { name: "Marketing", amount: "₹7,890", pct: 17.3, color: "#38bdf8" },
];

const Reports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reportType, setReportType] = useState("Monthly");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [exportFormat, setExportFormat] = useState("PDF");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setTimeout(() => {
      toast.success("Report downloaded!");
      setGenerating(false);
    }, 1500);
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
            <Link to="/reports" style={{ ...s.appNavLink, color: "white" }}>
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
                Total Amount
              </p>
              <p
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: "white",
                }}
              >
                ₹45,678.90
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
                value: "1,247",
                color: "#16a34a",
              },
              {
                icon: "📈",
                label: "Avg. Daily",
                value: "₹1,522",
                color: "#ea580c",
              },
              {
                icon: "⬆️",
                label: "Highest Expense",
                value: "₹12,450",
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
