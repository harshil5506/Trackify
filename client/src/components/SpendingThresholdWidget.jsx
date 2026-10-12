import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/finance";

const SpendingThresholdWidget = () => {
  const [thresholdData, setThresholdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states for configuration modal
  const [formData, setFormData] = useState({
    limit: 50000,
    warningThresholdPct: 80,
    enabled: true,
  });

  const fetchThreshold = async () => {
    try {
      const { data } = await API.get("/api/user/spending-threshold");
      setThresholdData(data);
      setFormData({
        limit: data.limit || 50000,
        warningThresholdPct: data.warningThresholdPct || 80,
        enabled: data.enabled !== false,
      });
    } catch (err) {
      console.warn("Could not load spending threshold", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreshold();
  }, []);

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await API.put("/api/user/spending-threshold", {
        limit: Number(formData.limit),
        warningThresholdPct: Number(formData.warningThresholdPct),
        enabled: formData.enabled,
      });
      setThresholdData(data.threshold);
      toast.success("Monthly spending threshold updated!");
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to update threshold");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;
  if (!thresholdData || !thresholdData.enabled) {
    return (
      <div style={styles.disabledBanner}>
        <div>
          <span style={{ fontSize: "1.1rem", marginRight: "8px" }}>🎯</span>
          <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.95rem" }}>
            Monthly Spending Threshold Guard
          </span>
          <span style={{ fontSize: "0.85rem", color: "#64748b", marginLeft: "10px" }}>
            (Currently Paused)
          </span>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.configBtnSmall}>
          ⚙️ Configure Threshold
        </button>
      </div>
    );
  }

  const {
    limit,
    warningThresholdPct,
    spent,
    remaining,
    percentage,
    status,
    daysRemaining,
    dailySafeVelocity,
    monthName,
  } = thresholdData;

  const getStatusDetails = () => {
    if (status === "breached") {
      return {
        badgeText: "🚨 LIMIT BREACHED",
        badgeBg: "#fee2e2",
        badgeColor: "#b91c1c",
        barColor: "#ef4444",
        message: `You have exceeded your monthly spending threshold by ${formatCurrency(spent - limit)}!`,
      };
    }
    if (status === "warning") {
      return {
        badgeText: `⚠️ WARNING (>${warningThresholdPct}%)`,
        badgeBg: "#fef3c7",
        badgeColor: "#b45309",
        barColor: "#f59e0b",
        message: `Spending is approaching your monthly threshold limit. Safe daily spend: ${formatCurrency(dailySafeVelocity)}/day.`,
      };
    }
    return {
      badgeText: "✅ HEALTHY BUDGET",
      badgeBg: "#dcfce7",
      badgeColor: "#15803d",
      barColor: "#10b981",
      message: `On track! You can safely spend up to ${formatCurrency(dailySafeVelocity)}/day for the remaining ${daysRemaining} days.`,
    };
  };

  const statusInfo = getStatusDetails();

  return (
    <div style={styles.card}>
      {/* Top Header */}
      <div style={styles.topRow}>
        <div style={styles.titleSection}>
          <div style={styles.badgeRow}>
            <span style={styles.iconTag}>🎯 Budget Guard</span>
            <span
              style={{
                ...styles.statusBadge,
                backgroundColor: statusInfo.badgeBg,
                color: statusInfo.badgeColor,
              }}
            >
              {statusInfo.badgeText}
            </span>
          </div>
          <h3 style={styles.heading}>Monthly Spending Threshold ({monthName})</h3>
        </div>

        <button onClick={() => setShowModal(true)} style={styles.configBtn}>
          ⚙️ Configure Cap
        </button>
      </div>

      {/* Numerical Metrics Row */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricItem}>
          <span style={styles.metricLabel}>Current Month Spent</span>
          <span style={styles.metricValue}>{formatCurrency(spent)}</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricLabel}>Configured Monthly Cap</span>
          <span style={styles.metricValueMuted}>{formatCurrency(limit)}</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricLabel}>Remaining Buffer</span>
          <span
            style={{
              ...styles.metricValue,
              color: status === "breached" ? "#ef4444" : "#10b981",
            }}
          >
            {status === "breached" ? "₹0 (Over Budget)" : formatCurrency(remaining)}
          </span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricLabel}>Safe Run Rate</span>
          <span style={styles.metricValue}>
            {status === "breached" ? "₹0 / day" : `${formatCurrency(dailySafeVelocity)} / day`}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar with Threshold Marker */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBarTrack}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${Math.min(100, Math.max(0, percentage))}%`,
              backgroundColor: statusInfo.barColor,
            }}
          />
          {/* Warning marker pin */}
          <div
            style={{
              ...styles.warningMarker,
              left: `${warningThresholdPct}%`,
            }}
            title={`Alert Threshold at ${warningThresholdPct}%`}
          />
        </div>
        <div style={styles.progressLabelRow}>
          <span style={styles.progressPct}>{percentage}% utilized</span>
          <span style={styles.thresholdMarkerText}>
            Warning Alert Pin: {warningThresholdPct}% ({formatCurrency((limit * warningThresholdPct) / 100)})
          </span>
        </div>
      </div>

      {/* Advisory Message */}
      <div style={styles.advisoryText}>{statusInfo.message}</div>

      {/* Configuration Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>⚙️ Configure Monthly Spending Threshold</h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                ✕
              </button>
            </div>
            <p style={styles.modalSub}>
              Set your overall maximum monthly expenditure ceiling and customize early warning alert triggers.
            </p>

            <form onSubmit={handleSaveThreshold} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Overall Monthly Spending Cap (₹)</label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. 50000"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>
                  Early Warning Alert Threshold: {formData.warningThresholdPct}% (
                  {formatCurrency((Number(formData.limit || 0) * Number(formData.warningThresholdPct)) / 100)})
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={formData.warningThresholdPct}
                  onChange={(e) => setFormData({ ...formData, warningThresholdPct: e.target.value })}
                  style={styles.rangeSlider}
                />
                <span style={styles.sliderHint}>
                  Triggers an active alert on your dashboard when current monthly spend crosses this percentage.
                </span>
              </div>

              <div style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  id="thresholdEnable"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="thresholdEnable" style={styles.checkboxLabel}>
                  Enable active monthly spending threshold guard
                </label>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? "Saving..." : "Save Threshold"}
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
    padding: "22px 24px",
    marginBottom: "24px",
    boxShadow: "0 4px 12px -2px rgba(0,0,0,0.05)",
  },
  disabledBanner: {
    backgroundColor: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "16px",
  },
  titleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  iconTag: {
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "12px",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "800",
    padding: "3px 10px",
    borderRadius: "12px",
  },
  heading: {
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    fontFamily: "'Sora', sans-serif",
  },
  configBtn: {
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  configBtnSmall: {
    background: "#ffffff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "14px",
    marginBottom: "16px",
  },
  metricItem: {
    background: "#f8fafc",
    padding: "12px 14px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  metricLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "#1e293b",
  },
  metricValueMuted: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#475569",
  },
  progressContainer: {
    marginBottom: "12px",
  },
  progressBarTrack: {
    position: "relative",
    width: "100%",
    height: "12px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },
  warningMarker: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "3px",
    backgroundColor: "#d97706",
    zIndex: 2,
  },
  progressLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
  },
  progressPct: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#0f172a",
  },
  thresholdMarkerText: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "500",
  },
  advisoryText: {
    fontSize: "0.86rem",
    color: "#475569",
    background: "#f8fafc",
    padding: "10px 14px",
    borderRadius: "8px",
    borderLeft: "3px solid #3b82f6",
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
    maxWidth: "480px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
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
    fontSize: "0.88rem",
    color: "#64748b",
    marginBottom: "20px",
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fieldLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    fontSize: "15px",
    fontWeight: "600",
    outline: "none",
  },
  rangeSlider: {
    width: "100%",
    accentColor: "#2563eb",
    cursor: "pointer",
  },
  sliderHint: {
    fontSize: "11px",
    color: "#64748b",
    lineHeight: "1.3",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "4px",
  },
  checkboxLabel: {
    fontSize: "13px",
    color: "#334155",
    fontWeight: "600",
    cursor: "pointer",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "12px",
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
    background: "#1a2ea8",
    color: "#ffffff",
    border: "none",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default SpendingThresholdWidget;
