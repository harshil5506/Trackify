import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/finance";

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

const InvestmentPortfolioWidget = () => {
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    assetClass: "Stocks",
    investedAmount: "",
    currentValue: "",
    institution: "",
  });

  const fetchInvestments = async () => {
    try {
      const { data } = await API.get("/api/investments");
      setInvestments(data.investments || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.warn("Could not load investments summary", err);
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
      });
      toast.success("Investment asset added to portfolio!");
      setShowAddModal(false);
      setForm({
        name: "",
        assetClass: "Stocks",
        investedAmount: "",
        currentValue: "",
        institution: "",
      });
      fetchInvestments();
    } catch (err) {
      toast.error("Failed to add investment asset");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  const totalCurrentValue = summary?.totalCurrentValue || 0;
  const totalInvested = summary?.totalInvested || 0;
  const totalReturns = summary?.totalReturns || 0;
  const returnPercentage = summary?.returnPercentage || 0;
  const isProfit = totalReturns >= 0;

  return (
    <div style={styles.card}>
      {/* Top Header */}
      <div style={styles.headerRow}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.badgeTag}>📈 Wealth & Portfolio</span>
            <span style={styles.assetCountBadge}>
              {investments.length} Asset{investments.length !== 1 ? "s" : ""}
            </span>
          </div>
          <h3 style={styles.heading}>Investment Asset Tracking</h3>
        </div>

        <div style={styles.btnGroup}>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            + Add Asset
          </button>
          <Link to="/investments" style={styles.manageBtn}>
            Manage All →
          </Link>
        </div>
      </div>

      {/* Main Metrics Overview */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Total Portfolio Value</span>
          <span style={styles.metricMain}>{formatCurrency(totalCurrentValue)}</span>
        </div>

        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Capital Invested</span>
          <span style={styles.metricSub}>{formatCurrency(totalInvested)}</span>
        </div>

        <div style={styles.metricBox}>
          <span style={styles.metricLabel}>Total Return</span>
          <span
            style={{
              ...styles.metricMain,
              color: isProfit ? "#16a34a" : "#dc2626",
            }}
          >
            {isProfit ? `+${formatCurrency(totalReturns)}` : formatCurrency(totalReturns)}{" "}
            <span style={styles.returnPctBadge}>
              ({isProfit ? "+" : ""}
              {returnPercentage}%)
            </span>
          </span>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      {summary?.assetAllocation && summary.assetAllocation.length > 0 && (
        <div style={styles.allocationSection}>
          <span style={styles.allocationTitle}>Asset Class Allocation</span>
          <div style={styles.allocationPillsRow}>
            {summary.assetAllocation.map((item, idx) => (
              <div key={idx} style={styles.allocationPill}>
                <span>{ASSET_ICONS[item.assetClass] || "💼"}</span>
                <span style={styles.pillClass}>{item.assetClass}</span>
                <span style={styles.pillPct}>{item.percentage}%</span>
                <span style={styles.pillVal}>({formatCurrency(item.currentValue)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Assets Mini Table */}
      {investments.length > 0 ? (
        <div style={styles.holdingsSection}>
          <span style={styles.holdingsTitle}>Top Portfolio Holdings</span>
          <div style={styles.holdingsList}>
            {investments.slice(0, 4).map((asset) => {
              const gain = asset.currentValue - asset.investedAmount;
              const gainPct =
                asset.investedAmount > 0
                  ? ((gain / asset.investedAmount) * 100).toFixed(1)
                  : 0;
              const isAssetProfit = gain >= 0;

              return (
                <div key={asset._id} style={styles.holdingItem}>
                  <div style={styles.holdingLeft}>
                    <span style={styles.holdingIcon}>
                      {ASSET_ICONS[asset.assetClass] || "💼"}
                    </span>
                    <div>
                      <div style={styles.holdingName}>{asset.name}</div>
                      <div style={styles.holdingMeta}>
                        {asset.assetClass} • {asset.institution || "Personal"}
                      </div>
                    </div>
                  </div>

                  <div style={styles.holdingRight}>
                    <div style={styles.holdingVal}>{formatCurrency(asset.currentValue)}</div>
                    <div
                      style={{
                        ...styles.holdingGain,
                        color: isAssetProfit ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {isAssetProfit ? "+" : ""}
                      {formatCurrency(gain)} ({isAssetProfit ? "+" : ""}
                      {gainPct}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>
            No investment assets added yet. Track your Stocks, Mutual Funds, Fixed Deposits, Gold, and Crypto in one unified dashboard!
          </p>
          <button onClick={() => setShowAddModal(true)} style={styles.emptyBtn}>
            + Add Your First Investment
          </button>
        </div>
      )}

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
            <p style={styles.modalSub}>
              Embed your assets into Trackify to monitor total net worth and asset class allocations.
            </p>

            <form onSubmit={handleAddAsset} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Asset Name / Ticker</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parag Parikh Flexi Cap, TCS, Gold SGB"
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
                    <option value="Fixed Deposit">🏦 Fixed Deposit / Recurring</option>
                    <option value="Gold">🥇 Gold / Sovereign Gold Bonds</option>
                    <option value="Crypto">🪙 Cryptocurrency</option>
                    <option value="Real Estate">🏢 Real Estate / REITs</option>
                    <option value="Bonds">📜 Government / Corporate Bonds</option>
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
                  <label style={styles.fieldLabel}>Invested Capital (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="e.g. 25000"
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
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 4px 12px -2px rgba(0,0,0,0.05)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  badgeTag: {
    background: "#f0fdf4",
    color: "#16a34a",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "12px",
  },
  assetCountBadge: {
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "12px",
  },
  heading: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    fontFamily: "'Sora', sans-serif",
  },
  btnGroup: {
    display: "flex",
    gap: "8px",
  },
  addBtn: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  manageBtn: {
    background: "#f8fafc",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  metricBox: {
    background: "#f8fafc",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
  },
  metricLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "4px",
  },
  metricMain: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#0f172a",
  },
  metricSub: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#475569",
  },
  returnPctBadge: {
    fontSize: "12px",
    fontWeight: "700",
  },
  allocationSection: {
    marginBottom: "20px",
  },
  allocationTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    display: "block",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  allocationPillsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  allocationPill: {
    background: "#f1f5f9",
    borderRadius: "20px",
    padding: "5px 12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
  },
  pillClass: {
    fontWeight: "700",
    color: "#1e293b",
  },
  pillPct: {
    fontWeight: "800",
    color: "#2563eb",
  },
  pillVal: {
    color: "#64748b",
    fontSize: "11px",
  },
  holdingsSection: {
    marginTop: "16px",
  },
  holdingsTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    display: "block",
    marginBottom: "10px",
    textTransform: "uppercase",
  },
  holdingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  holdingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #f1f5f9",
  },
  holdingLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  holdingIcon: {
    fontSize: "1.2rem",
  },
  holdingName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1e293b",
  },
  holdingMeta: {
    fontSize: "11px",
    color: "#64748b",
  },
  holdingRight: {
    textAlign: "right",
  },
  holdingVal: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#0f172a",
  },
  holdingGain: {
    fontSize: "11px",
    fontWeight: "700",
  },
  emptyState: {
    textAlign: "center",
    padding: "24px 16px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px dashed #cbd5e1",
  },
  emptyText: {
    fontSize: "0.88rem",
    color: "#64748b",
    marginBottom: "14px",
    maxWidth: "480px",
    margin: "0 auto 14px auto",
  },
  emptyBtn: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // Modal Styles
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
    marginBottom: "6px",
  },
  modalTitle: {
    fontSize: "1.2rem",
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
    marginBottom: "20px",
    lineHeight: "1.4",
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

export default InvestmentPortfolioWidget;
