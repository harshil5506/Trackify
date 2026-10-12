import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/finance";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const ASSET_ICONS = {
  Stocks: "📊",
  "Mutual Funds": "📈",
  "Fixed Deposit": "🏦",
  Crypto: "🪙",
  Gold: "🥇",
  "Real Estate": "🏢",
  Bonds: "📜",
  Other: "💼",
};

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
  "#10b981",
];

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: "",
    assetClass: "Stocks",
    investedAmount: "",
    currentValue: "",
    institution: "",
    notes: "",
  });

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/investments");
      setInvestments(data.investments || []);
      setSummary(data.summary || null);
    } catch (err) {
      toast.error("Failed to load investments portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Asset name is required");
    if (!form.investedAmount || Number(form.investedAmount) <= 0) {
      return toast.error("Valid invested amount is required");
    }

    try {
      setSaving(true);
      await API.post("/api/investments", {
        name: form.name.trim(),
        assetClass: form.assetClass,
        investedAmount: Number(form.investedAmount),
        currentValue: form.currentValue ? Number(form.currentValue) : Number(form.investedAmount),
        institution: form.institution.trim(),
        notes: form.notes.trim(),
      });
      toast.success("Investment asset added!");
      setShowAddModal(false);
      setForm({
        name: "",
        assetClass: "Stocks",
        investedAmount: "",
        currentValue: "",
        institution: "",
        notes: "",
      });
      fetchInvestments();
    } catch (err) {
      toast.error("Failed to add investment");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateValuation = async (e) => {
    e.preventDefault();
    if (!editingAsset) return;

    try {
      setSaving(true);
      await API.put(`/api/investments/${editingAsset._id}`, {
        currentValue: Number(editingAsset.currentValue),
        notes: editingAsset.notes,
      });
      toast.success("Asset valuation updated!");
      setEditingAsset(null);
      fetchInvestments();
    } catch (err) {
      toast.error("Failed to update valuation");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsset = async (id, name) => {
    if (!window.confirm(`Delete ${name} from your portfolio?`)) return;

    try {
      await API.delete(`/api/investments/${id}`);
      toast.success("Asset removed from portfolio");
      fetchInvestments();
    } catch (err) {
      toast.error("Failed to delete asset");
    }
  };

  const filteredInvestments =
    selectedFilter === "All"
      ? investments
      : investments.filter((i) => i.assetClass === selectedFilter);

  const pieData =
    summary?.assetAllocation?.map((item) => ({
      name: item.assetClass,
      value: item.currentValue,
    })) || [];

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.headerTag}>📈 Wealth & Asset Management</span>
          <h1 style={styles.title}>Investment Portfolio</h1>
          <p style={styles.subtitle}>
            Track your asset allocation, capital growth, and real-time valuations across Stocks, Mutual Funds, Crypto, Gold, and Fixed Deposits.
          </p>
        </div>

        <div style={styles.headerBtns}>
          <Link to="/dashboard" style={styles.backBtn}>
            ← Back to Dashboard
          </Link>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            + Add New Asset
          </button>
        </div>
      </div>

      {/* Top Portfolio Summary Cards */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Portfolio Valuation</span>
          <div style={styles.metricVal}>{formatCurrency(summary?.totalCurrentValue || 0)}</div>
          <span style={styles.metricSub}>{investments.length} total holdings</span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Capital Invested</span>
          <div style={styles.metricValMuted}>{formatCurrency(summary?.totalInvested || 0)}</div>
          <span style={styles.metricSub}>Net principal deployed</span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Absolute Return</span>
          <div
            style={{
              ...styles.metricVal,
              color: (summary?.totalReturns || 0) >= 0 ? "#16a34a" : "#dc2626",
            }}
          >
            {(summary?.totalReturns || 0) >= 0 ? "+" : ""}
            {formatCurrency(summary?.totalReturns || 0)}
          </div>
          <span
            style={{
              ...styles.returnBadge,
              backgroundColor: (summary?.totalReturns || 0) >= 0 ? "#dcfce7" : "#fee2e2",
              color: (summary?.totalReturns || 0) >= 0 ? "#15803d" : "#b91c1c",
            }}
          >
            {(summary?.totalReturns || 0) >= 0 ? "+" : ""}
            {summary?.returnPercentage || 0}% overall gain
          </span>
        </div>
      </div>

      {/* Asset Allocation Chart & Stats */}
      {pieData.length > 0 && (
        <div style={styles.allocationRow}>
          <div style={styles.chartCard}>
            <h3 style={styles.sectionHeading}>Asset Class Distribution</h3>
            <div style={{ height: "240px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.allocationListCard}>
            <h3 style={styles.sectionHeading}>Category Performance</h3>
            <div style={styles.categoryList}>
              {summary?.assetAllocation?.map((cat, idx) => (
                <div key={idx} style={styles.catItem}>
                  <div style={styles.catLeft}>
                    <span style={{ fontSize: "1.2rem" }}>{ASSET_ICONS[cat.assetClass] || "💼"}</span>
                    <div>
                      <div style={styles.catName}>{cat.assetClass}</div>
                      <div style={styles.catMeta}>
                        {cat.count} asset{cat.count !== 1 ? "s" : ""} • {cat.percentage}% of portfolio
                      </div>
                    </div>
                  </div>
                  <div style={styles.catRight}>
                    <div style={styles.catVal}>{formatCurrency(cat.currentValue)}</div>
                    <div
                      style={{
                        ...styles.catGain,
                        color: cat.returns >= 0 ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {cat.returns >= 0 ? "+" : ""}
                      {formatCurrency(cat.returns)} ({cat.returnPercentage}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Assets Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeaderRow}>
          <h3 style={styles.sectionHeading}>All Asset Holdings</h3>

          {/* Filter Pills */}
          <div style={styles.filterPills}>
            {["All", "Stocks", "Mutual Funds", "Fixed Deposit", "Gold", "Crypto", "Real Estate", "Bonds"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                style={{
                  ...styles.filterBtn,
                  ...(selectedFilter === filter ? styles.filterBtnActive : {}),
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredInvestments.length > 0 ? (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Asset Name</th>
                  <th style={styles.th}>Class</th>
                  <th style={styles.th}>Institution</th>
                  <th style={styles.th}>Invested</th>
                  <th style={styles.th}>Current Value</th>
                  <th style={styles.th}>Gain / Loss</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestments.map((asset) => {
                  const gain = asset.currentValue - asset.investedAmount;
                  const gainPct =
                    asset.investedAmount > 0
                      ? ((gain / asset.investedAmount) * 100).toFixed(1)
                      : 0;
                  const isProfit = gain >= 0;

                  return (
                    <tr key={asset._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.tdNameRow}>
                          <span style={styles.tdIcon}>{ASSET_ICONS[asset.assetClass] || "💼"}</span>
                          <span style={styles.tdName}>{asset.name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.classPill}>{asset.assetClass}</span>
                      </td>
                      <td style={styles.td}>{asset.institution || "—"}</td>
                      <td style={styles.td}>{formatCurrency(asset.investedAmount)}</td>
                      <td style={styles.td}>
                        <strong>{formatCurrency(asset.currentValue)}</strong>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.gainPill,
                            backgroundColor: isProfit ? "#dcfce7" : "#fee2e2",
                            color: isProfit ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(gain)} ({isProfit ? "+" : ""}
                          {gainPct}%)
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionBtnsRow}>
                          <button
                            onClick={() => setEditingAsset(asset)}
                            style={styles.editBtn}
                            title="Update Valuation"
                          >
                            ✏️ Update
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset._id, asset.name)}
                            style={styles.delBtn}
                            title="Delete Asset"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyTable}>
            <p>No investment assets found in this category.</p>
            <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
              + Add Investment
            </button>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>+ Add Investment Asset</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAsset} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Asset Name / Security</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Industries, Axis Bluechip, Bitcoin"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldRow}>
                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                  <label style={styles.fieldLabel}>Asset Class</label>
                  <select
                    value={form.assetClass}
                    onChange={(e) => setForm({ ...form, assetClass: e.target.value })}
                    style={styles.select}
                  >
                    <option value="Stocks">📊 Stocks (Equities)</option>
                    <option value="Mutual Funds">📈 Mutual Funds & ETFs</option>
                    <option value="Fixed Deposit">🏦 Fixed Deposit</option>
                    <option value="Gold">🥇 Gold / Sovereign Bonds</option>
                    <option value="Crypto">🪙 Cryptocurrency</option>
                    <option value="Real Estate">🏢 Real Estate / REITs</option>
                    <option value="Bonds">📜 Bonds / Debt</option>
                    <option value="Other">💼 Other Assets</option>
                  </select>
                </div>

                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                  <label style={styles.fieldLabel}>Broker / Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. Zerodha, Groww, SBI"
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldRow}>
                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                  <label style={styles.fieldLabel}>Invested Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="e.g. 50000"
                    value={form.investedAmount}
                    onChange={(e) => setForm({ ...form, investedAmount: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                  <label style={styles.fieldLabel}>Current Market Valuation (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Defaults to invested"
                    value={form.currentValue}
                    onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. SIP started Oct 2024"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? "Saving..." : "Add to Portfolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Valuation Modal */}
      {editingAsset && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>✏️ Update Valuation: {editingAsset.name}</h3>
              <button onClick={() => setEditingAsset(null)} style={styles.closeBtn}>
                ✕
              </button>
            </div>
            <p style={styles.modalSub}>
              Invested Capital: {formatCurrency(editingAsset.investedAmount)} • Class: {editingAsset.assetClass}
            </p>

            <form onSubmit={handleUpdateValuation} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Updated Market Valuation (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={editingAsset.currentValue}
                  onChange={(e) =>
                    setEditingAsset({ ...editingAsset, currentValue: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Notes</label>
                <input
                  type="text"
                  value={editingAsset.notes || ""}
                  onChange={(e) =>
                    setEditingAsset({ ...editingAsset, notes: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? "Updating..." : "Save Valuation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 16px",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "28px",
  },
  headerTag: {
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 12px",
    borderRadius: "12px",
    display: "inline-block",
    marginBottom: "8px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    fontFamily: "'Sora', sans-serif",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginTop: "6px",
    maxWidth: "680px",
  },
  headerBtns: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  backBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
  },
  addBtn: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  metricCard: {
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  metricLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
  },
  metricVal: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#0f172a",
  },
  metricValMuted: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#475569",
  },
  metricSub: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
    display: "block",
  },
  returnBadge: {
    fontSize: "12px",
    fontWeight: "800",
    padding: "3px 10px",
    borderRadius: "12px",
    display: "inline-block",
    marginTop: "6px",
  },
  allocationRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
  },
  chartCard: {
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
  },
  allocationListCard: {
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
  },
  sectionHeading: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 16px 0",
    fontFamily: "'Sora', sans-serif",
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "240px",
    overflowY: "auto",
  },
  catItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    background: "#f8fafc",
    borderRadius: "10px",
  },
  catLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  catName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1e293b",
  },
  catMeta: {
    fontSize: "11px",
    color: "#64748b",
  },
  catRight: {
    textAlign: "right",
  },
  catVal: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#0f172a",
  },
  catGain: {
    fontSize: "11px",
    fontWeight: "700",
  },
  tableCard: {
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
  },
  tableHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },
  filterPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  filterBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  filterBtnActive: {
    background: "#2563eb",
    color: "#ffffff",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  thRow: {
    borderBottom: "1.5px solid #e2e8f0",
  },
  th: {
    padding: "12px 14px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "14px",
    fontSize: "13px",
    color: "#334155",
  },
  tdNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  tdIcon: {
    fontSize: "1.2rem",
  },
  tdName: {
    fontWeight: "700",
    color: "#0f172a",
  },
  classPill: {
    background: "#eff6ff",
    color: "#1e40af",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  gainPill: {
    fontSize: "11px",
    fontWeight: "800",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  actionBtnsRow: {
    display: "flex",
    gap: "6px",
  },
  editBtn: {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },
  delBtn: {
    background: "#fee2e2",
    border: "none",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },
  emptyTable: {
    textAlign: "center",
    padding: "36px",
    color: "#64748b",
  },

  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(3px)",
    padding: "16px",
  },
  modalContent: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "26px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#94a3b8",
    cursor: "pointer",
  },
  modalSub: {
    fontSize: "0.85rem",
    color: "#64748b",
    marginBottom: "18px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  fieldRow: {
    display: "flex",
    gap: "12px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  fieldLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },
  cancelBtn: {
    padding: "9px 16px",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "9px 20px",
    borderRadius: "8px",
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default Investments;
