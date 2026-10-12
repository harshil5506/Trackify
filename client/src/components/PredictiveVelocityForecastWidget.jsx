import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import API from "../api/axios";
import { formatCurrency } from "../utils/finance";

const PredictiveVelocityForecastWidget = ({ initialData = null, showDetails = true }) => {
  const [forecastData, setForecastData] = useState(initialData?.eomVelocityForecast || null);
  const [loading, setLoading] = useState(!initialData?.eomVelocityForecast);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("trajectory"); // 'trajectory' | 'details'

  useEffect(() => {
    if (initialData?.eomVelocityForecast) {
      setForecastData(initialData.eomVelocityForecast);
      setLoading(false);
      return;
    }

    const fetchForecast = async () => {
      setLoading(true);
      try {
        const res = await API.get("/api/analytics/predictions");
        if (res.data?.eomVelocityForecast) {
          setForecastData(res.data.eomVelocityForecast);
        }
      } catch (err) {
        console.error("Failed to load predictive velocity forecast:", err);
        setError("Unable to generate real-time velocity forecast");
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [initialData]);

  if (loading) {
    return (
      <div style={s.cardContainer}>
        <div style={s.skeletonHeader}>
          <div style={s.skeletonBox(180, 20)} />
          <div style={s.skeletonBox(100, 24)} />
        </div>
        <div style={s.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={s.skeletonCard} />
          ))}
        </div>
        <div style={{ ...s.skeletonBox("100%", 220), marginTop: 16 }} />
      </div>
    );
  }

  if (error || !forecastData) {
    return null;
  }

  const {
    monthName,
    totalDaysInMonth,
    elapsedDays,
    daysRemaining,
    spentSoFar,
    totalBudgetLimit,
    currentDailyVelocity,
    sma7DailyVelocity,
    emaDailyVelocity,
    safeTargetVelocity,
    velocityBurnRatio,
    pacingStatus,
    pacingLabel,
    projectedEomTotal,
    confidenceRange,
    projectedOverrunAmount,
    projectedSurplusAmount,
    projectedUtilizationPct,
    actionableAdvice,
    modelStats,
    dailyTrajectory,
  } = forecastData;

  const isOverrun = projectedOverrunAmount > 0;

  const getPacingBadgeStyle = () => {
    if (pacingStatus === "PACING_SAFE") {
      return {
        bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
        border: "#a7f3d0",
        color: "#065f46",
        icon: "🟢",
        text: "Safe Velocity Pace",
      };
    }
    if (pacingStatus === "PACING_MODERATE") {
      return {
        bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
        border: "#fde68a",
        color: "#92400e",
        icon: "🟡",
        text: "Moderate Burn Rate",
      };
    }
    return {
      bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
      border: "#fecaca",
      color: "#991b1b",
      icon: "🔴",
      text: "Accelerated Burn Rate",
    };
  };

  const badge = getPacingBadgeStyle();

  // Custom Chart Tooltip
  const CustomTrajectoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div style={s.tooltipContainer}>
          <div style={s.tooltipHeader}>
            <span style={{ fontWeight: "700", color: "#0f172a" }}>
              {dataPoint?.label || `Day ${label}`}
            </span>
            {dataPoint?.day === elapsedDays && (
              <span style={s.tooltipTodayBadge}>Today</span>
            )}
          </div>
          <div style={s.tooltipBody}>
            {dataPoint?.actualCumulative !== null && (
              <div style={s.tooltipRow}>
                <span style={{ color: "#1a2ea8", fontWeight: "600" }}>● Actual Spend:</span>
                <span style={s.tooltipVal}>{formatCurrency(dataPoint.actualCumulative)}</span>
              </div>
            )}
            {dataPoint?.projectedCumulative !== null && (
              <div style={s.tooltipRow}>
                <span style={{ color: "#9333ea", fontWeight: "600" }}>-- Projected Trend:</span>
                <span style={s.tooltipVal}>{formatCurrency(dataPoint.projectedCumulative)}</span>
              </div>
            )}
            {dataPoint?.confidenceUpper !== null && dataPoint?.day > elapsedDays && (
              <div style={s.tooltipRow}>
                <span style={{ color: "#a855f7", fontSize: "0.75rem" }}>Range (95% CI):</span>
                <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: "600" }}>
                  {formatCurrency(dataPoint.confidenceLower)} – {formatCurrency(dataPoint.confidenceUpper)}
                </span>
              </div>
            )}
            <div style={{ ...s.tooltipRow, borderTop: "1px dashed #e2e8f0", paddingTop: 4, marginTop: 4 }}>
              <span style={{ color: "#64748b" }}>Target Baseline:</span>
              <span style={{ color: "#334155", fontWeight: "600" }}>{formatCurrency(dataPoint?.targetPace || 0)}</span>
            </div>
            {dataPoint?.dailySpend !== null && dataPoint?.dailySpend > 0 && (
              <div style={{ ...s.tooltipRow, color: "#0284c7" }}>
                <span>Day Spend:</span>
                <span style={{ fontWeight: "700" }}>+{formatCurrency(dataPoint.dailySpend)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={s.cardContainer}>
      {/* ── Widget Header ── */}
      <div style={s.headerRow}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "1.3rem" }}>⚡</span>
            <h3 style={s.widgetTitle}>Predictive Spend Velocity & EOM Forecast</h3>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: "0.72rem",
                fontWeight: "700",
                background: badge.bg,
                border: `1px solid ${badge.border}`,
                color: badge.color,
              }}
            >
              <span>{badge.icon}</span>
              {badge.text}
            </span>
          </div>
          <p style={s.widgetSubtext}>
            Regression & Moving-Average velocity models projecting end-of-month expenditure trends for <strong>{monthName}</strong>.
          </p>
        </div>

        {showDetails && (
          <div style={s.tabContainer}>
            <button
              onClick={() => setActiveTab("trajectory")}
              style={{
                ...s.tabBtn,
                ...(activeTab === "trajectory" ? s.activeTabBtn : {}),
              }}
            >
              📈 Trajectory Curve
            </button>
            <button
              onClick={() => setActiveTab("details")}
              style={{
                ...s.tabBtn,
                ...(activeTab === "details" ? s.activeTabBtn : {}),
              }}
            >
              📐 Model Breakdown
            </button>
          </div>
        )}
      </div>

      {/* ── Real-Time Velocity Metrics Grid (4 Key Pillars) ── */}
      <div style={s.metricsGrid}>
        {/* Metric 1: Real-time Velocity */}
        <div style={s.metricCard}>
          <div style={s.metricHeader}>
            <span style={s.metricLabel}>Real-Time Daily Velocity</span>
            <span style={s.metricIcon("linear-gradient(135deg, #e0e7ff, #c7d2fe)")}>⚡</span>
          </div>
          <div style={s.metricValueRow}>
            <span style={{ ...s.metricValue, color: "#1e1b4b" }}>
              {formatCurrency(emaDailyVelocity)}
            </span>
            <span style={s.metricUnit}>/day</span>
          </div>
          <div style={s.metricFooter}>
            <span style={s.metricFootnote}>
              7-Day SMA: <strong>{formatCurrency(sma7DailyVelocity)}/day</strong>
            </span>
            <span style={s.metricFootnote}>
              Pace burn: <strong>{(velocityBurnRatio * 100).toFixed(0)}%</strong> of safe speed
            </span>
          </div>
        </div>

        {/* Metric 2: Safe Target Velocity */}
        <div style={s.metricCard}>
          <div style={s.metricHeader}>
            <span style={s.metricLabel}>Safe Target Daily Pace</span>
            <span style={s.metricIcon("linear-gradient(135deg, #dcfce7, #bbf7d0)")}>🎯</span>
          </div>
          <div style={s.metricValueRow}>
            <span style={{ ...s.metricValue, color: "#065f46" }}>
              {formatCurrency(safeTargetVelocity)}
            </span>
            <span style={s.metricUnit}>/day</span>
          </div>
          <div style={s.metricFooter}>
            <span style={s.metricFootnote}>
              Budget remaining: <strong>{formatCurrency(Math.max(0, totalBudgetLimit - spentSoFar))}</strong>
            </span>
            <span style={s.metricFootnote}>
              Days left: <strong>{daysRemaining} of {totalDaysInMonth}</strong>
            </span>
          </div>
        </div>

        {/* Metric 3: Current Spend Pacing */}
        <div style={s.metricCard}>
          <div style={s.metricHeader}>
            <span style={s.metricLabel}>Spend as of Day {elapsedDays}</span>
            <span style={s.metricIcon("linear-gradient(135deg, #fef3c7, #fde68a)")}>📅</span>
          </div>
          <div style={s.metricValueRow}>
            <span style={{ ...s.metricValue, color: "#92400e" }}>
              {formatCurrency(spentSoFar)}
            </span>
            <span style={s.metricUnit}>spent</span>
          </div>
          <div style={s.metricFooter}>
            <span style={s.metricFootnote}>
              Threshold / Budget: <strong>{formatCurrency(totalBudgetLimit)}</strong>
            </span>
            <span style={s.metricFootnote}>
              Month elapsed: <strong>{((elapsedDays / totalDaysInMonth) * 100).toFixed(0)}%</strong>
            </span>
          </div>
        </div>

        {/* Metric 4: Forecasted EOM Total */}
        <div
          style={{
            ...s.metricCard,
            background: isOverrun
              ? "linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)"
              : "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
            border: isOverrun ? "1.5px solid #fecaca" : "1.5px solid #ddd6fe",
          }}
        >
          <div style={s.metricHeader}>
            <span style={{ ...s.metricLabel, color: isOverrun ? "#991b1b" : "#5b21b6" }}>
              Projected Month-End (EOM)
            </span>
            <span style={s.metricIcon(isOverrun ? "#fee2e2" : "#ede9fe")}>
              {isOverrun ? "⚠️" : "🔮"}
            </span>
          </div>
          <div style={s.metricValueRow}>
            <span style={{ ...s.metricValue, color: isOverrun ? "#dc2626" : "#6d28d9" }}>
              {formatCurrency(projectedEomTotal)}
            </span>
            <span style={{ ...s.metricUnit, color: isOverrun ? "#b91c1c" : "#7c3aed" }}>
              ({projectedUtilizationPct}%)
            </span>
          </div>
          <div style={s.metricFooter}>
            <span style={{ ...s.metricFootnote, color: isOverrun ? "#b91c1c" : "#6d28d9" }}>
              {isOverrun ? (
                <span>Overrun: +{formatCurrency(projectedOverrunAmount)}</span>
              ) : (
                <span>Buffer: {formatCurrency(projectedSurplusAmount)}</span>
              )}
            </span>
            <span style={{ ...s.metricFootnote, color: "#64748b" }}>
              95% CI: ±{formatCurrency(confidenceRange.margin)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Active Tab View ── */}
      {activeTab === "trajectory" ? (
        <div style={s.chartSection}>
          <div style={s.chartHeaderRow}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={s.chartSectionTitle}>End-of-Month Cumulative Trajectory</span>
              <div style={s.legendPills}>
                <span style={s.legendItem("#1a2ea8", false)}>● Actual Spent (Days 1–{elapsedDays})</span>
                <span style={s.legendItem("#9333ea", true)}>-- Projected Pace</span>
                <span style={s.legendItem("#059669", true)}>·· Budget Baseline</span>
              </div>
            </div>
            <span style={s.chartHint}>Confidence envelope shaded in purple</span>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dailyTrajectory}
                margin={{ top: 10, right: 20, bottom: 5, left: 10 }}
              >
                <defs>
                  <linearGradient id="confidenceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `D${val}`}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTrajectoryTooltip />} />

                {/* Target Linear Pace Reference */}
                <Line
                  type="monotone"
                  dataKey="targetPace"
                  name="Budget Baseline"
                  stroke="#059669"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />

                {/* Confidence Range Area */}
                <Area
                  type="monotone"
                  dataKey="confidenceUpper"
                  stroke="none"
                  fill="url(#confidenceAreaGrad)"
                  isAnimationActive={false}
                />

                {/* Projected Trajectory Line */}
                <Line
                  type="monotone"
                  dataKey="projectedCumulative"
                  name="Projected Trend"
                  stroke="#9333ea"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: "#9333ea", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#7e22ce" }}
                  connectNulls
                />

                {/* Actual Cumulative Spent Line */}
                <Line
                  type="monotone"
                  dataKey="actualCumulative"
                  name="Actual Spent"
                  stroke="#1a2ea8"
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: "#1a2ea8" }}
                  activeDot={{ r: 6, fill: "#1e1b4b" }}
                  connectNulls
                />

                {/* Reference line marking Today */}
                <ReferenceLine
                  x={elapsedDays}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{
                    value: "Today",
                    position: "top",
                    fill: "#d97706",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* ── Model Breakdown Tab ── */
        <div style={s.modelDetailsSection}>
          <div style={s.modelGrid}>
            <div style={s.modelCard}>
              <div style={s.modelCardTitle}>
                <span>📊</span> Ordinary Least Squares (OLS) Regression
              </div>
              <p style={s.modelText}>
                Fits cumulative daily expenditures $y = m \cdot \text{day} + c$ over the elapsed {elapsedDays} days.
              </p>
              <div style={s.modelMetricsList}>
                <div style={s.modelMetricRow}>
                  <span>Acceleration Slope ($m$):</span>
                  <strong>₹{modelStats.regressionSlope}/day</strong>
                </div>
                <div style={s.modelMetricRow}>
                  <span>Goodness-of-Fit ($R^2$):</span>
                  <strong>{modelStats.regressionR2}</strong>
                </div>
                <div style={s.modelMetricRow}>
                  <span>Data Points Sampled:</span>
                  <strong>{elapsedDays} days</strong>
                </div>
              </div>
            </div>

            <div style={s.modelCard}>
              <div style={s.modelCardTitle}>
                <span>🌊</span> Exponential Moving Average (EMA)
              </div>
              <p style={s.modelText}>
                Weights recent daily burn rate momentum to capture recent lifestyle changes and weekend spending surges.
              </p>
              <div style={s.modelMetricsList}>
                <div style={s.modelMetricRow}>
                  <span>Smoothing Factor ($\alpha$):</span>
                  <strong>{modelStats.emaAlpha} (7-Day window)</strong>
                </div>
                <div style={s.modelMetricRow}>
                  <span>EMA Velocity:</span>
                  <strong>{formatCurrency(emaDailyVelocity)}/day</strong>
                </div>
                <div style={s.modelMetricRow}>
                  <span>7-Day SMA Velocity:</span>
                  <strong>{formatCurrency(sma7DailyVelocity)}/day</strong>
                </div>
              </div>
            </div>

            <div style={s.modelCard}>
              <div style={s.modelCardTitle}>
                <span>🤝</span> Ensemble Blending & Confidence Bands
              </div>
              <p style={s.modelText}>
                Combines OLS regression slope with moving-average momentum. Generates 95% confidence intervals that widen towards month-end.
              </p>
              <div style={s.modelMetricsList}>
                <div style={s.modelMetricRow}>
                  <span>Ensemble Weighting:</span>
                  <strong>50% Regression + 50% EMA</strong>
                </div>
                <div style={s.modelMetricRow}>
                  <span>Expected EOM:</span>
                  <strong>{formatCurrency(projectedEomTotal)}</strong>
                </div>
                <div style={s.modelMetricRow}>
                  <span>Confidence Margin:</span>
                  <strong>±{formatCurrency(confidenceRange.margin)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Actionable Strategic Guidance ── */}
      <div
        style={{
          ...s.adviceContainer,
          background: isOverrun ? "#fffbeb" : "#f0fdf4",
          border: isOverrun ? "1px solid #fde68a" : "1px solid #bbf7d0",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: "1.2rem", marginTop: 1 }}>{isOverrun ? "💡" : "✨"}</span>
          <div>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "0.85rem",
                fontWeight: "700",
                color: isOverrun ? "#b45309" : "#15803d",
              }}
            >
              Actionable Spend Velocity Strategy
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: isOverrun ? "#92400e" : "#166534",
                lineHeight: 1.5,
              }}
            >
              {actionableAdvice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  cardContainer: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "22px 24px",
    boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },
  widgetTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  widgetSubtext: {
    fontSize: "0.82rem",
    color: "#64748b",
    marginTop: "4px",
    marginBottom: 0,
  },
  tabContainer: {
    display: "inline-flex",
    background: "#f1f5f9",
    padding: "3px",
    borderRadius: "8px",
    gap: "4px",
  },
  tabBtn: {
    border: "none",
    background: "transparent",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.76rem",
    fontWeight: "600",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activeTabBtn: {
    background: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
  },
  metricCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  metricIcon: (bg) => ({
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
  }),
  metricValueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "5px",
    marginTop: "2px",
  },
  metricValue: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.35rem",
    fontWeight: "800",
  },
  metricUnit: {
    fontSize: "0.8rem",
    color: "#64748b",
    fontWeight: "600",
  },
  metricFooter: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    marginTop: "4px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "6px",
  },
  metricFootnote: {
    fontSize: "0.73rem",
    color: "#64748b",
  },
  chartSection: {
    background: "#fafbfd",
    border: "1px solid #edf2f7",
    borderRadius: "12px",
    padding: "16px 16px 10px 16px",
  },
  chartHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "12px",
  },
  chartSectionTitle: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#0f172a",
  },
  legendPills: {
    display: "flex",
    gap: "10px",
    fontSize: "0.74rem",
    flexWrap: "wrap",
  },
  legendItem: (color, isDashed) => ({
    color,
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
  }),
  chartHint: {
    fontSize: "0.72rem",
    color: "#94a3b8",
  },
  tooltipContainer: {
    background: "rgba(255, 255, 255, 0.98)",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "10px 12px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.12)",
    fontSize: "0.8rem",
    minWidth: "170px",
  },
  tooltipHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "4px",
  },
  tooltipTodayBadge: {
    background: "#fef3c7",
    color: "#b45309",
    fontSize: "0.68rem",
    padding: "1px 6px",
    borderRadius: "10px",
    fontWeight: "700",
  },
  tooltipBody: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  tooltipRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  tooltipVal: {
    fontWeight: "700",
    color: "#0f172a",
  },
  modelDetailsSection: {
    padding: "4px 0",
  },
  modelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
  },
  modelCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  modelCardTitle: {
    fontSize: "0.88rem",
    fontWeight: "700",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  modelText: {
    fontSize: "0.78rem",
    color: "#64748b",
    lineHeight: 1.45,
    margin: 0,
  },
  modelMetricsList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "6px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "8px",
  },
  modelMetricRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.77rem",
    color: "#475569",
  },
  adviceContainer: {
    borderRadius: "12px",
    padding: "12px 16px",
  },
  skeletonHeader: {
    display: "flex",
    justifyContent: "space-between",
  },
  skeletonBox: (width, height) => ({
    width,
    height,
    background: "#f1f5f9",
    borderRadius: "6px",
  }),
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },
  skeletonCard: {
    height: "100px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
};

export default PredictiveVelocityForecastWidget;
