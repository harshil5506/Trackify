import { useState, useEffect } from "react";
import API from "../api/axios";
import { formatCurrency } from "../utils/finance";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const MOOD_META = {
  Calm: { emoji: "🧘", label: "Calm & Planned", color: "#10b981", bg: "#ecfdf5" },
  Happy: { emoji: "😊", label: "Happy / Reward", color: "#3b82f6", bg: "#eff6ff" },
  Social: { emoji: "🥳", label: "Social & Gatherings", color: "#8b5cf6", bg: "#f5f3ff" },
  Bored: { emoji: "🥱", label: "Boredom", color: "#f59e0b", bg: "#fffbeb" },
  Stressed: { emoji: "😫", label: "Stress Retail", color: "#f97316", bg: "#fff7ed" },
  Impulsive: { emoji: "⚡", label: "Impulse Buy", color: "#ef4444", bg: "#fef2f2" },
  Other: { emoji: "📦", label: "Routine", color: "#64748b", bg: "#f8fafc" },
};

const MoodSpendingWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const res = await API.get("/api/analytics/mood-spending");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load mood spending analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMoodData();
  }, []);

  if (loading) {
    return (
      <div style={s.card}>
        <p style={{ color: "#64748b", margin: 0 }}>Loading emotional spending insights...</p>
      </div>
    );
  }

  if (!data || data.totalSpent === 0) {
    return (
      <div style={s.card}>
        <div style={s.headerRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.4rem" }}>💭</span>
            <div>
              <h3 style={s.title}>Emotional & Mood-Driven Spending</h3>
              <p style={s.subtitle}>
                Understand how feelings like stress, boredom, or impulse impact your wallet.
              </p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "30px 10px", color: "#64748b" }}>
          <p style={{ margin: "0 0 6px 0", fontSize: "0.95rem" }}>
            No emotional spending data recorded yet.
          </p>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            Tag how you feel when adding expenses to see personalized psychological insights!
          </span>
        </div>
      </div>
    );
  }

  const chartData = (data.moodBreakdown || [])
    .filter((m) => m.totalAmount > 0)
    .map((m) => ({
      name: `${m.emoji} ${m.mood}`,
      value: m.totalAmount,
      color: m.color,
    }));

  return (
    <div style={s.card}>
      {/* Title & Header */}
      <div style={s.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>💭</span>
          <div>
            <h3 style={s.title}>Emotional Spending & Impulse Tracker</h3>
            <p style={s.subtitle}>
              Financial psychology breakdown: See what emotional triggers lead to unplanned spending.
            </p>
          </div>
        </div>

        {/* Trigger index badge */}
        <div
          style={{
            ...s.triggerBadge,
            background:
              data.triggerPercentage > 25
                ? "#fee2e2"
                : data.triggerPercentage > 10
                ? "#fef3c7"
                : "#dcfce7",
            borderColor:
              data.triggerPercentage > 25
                ? "#fecaca"
                : data.triggerPercentage > 10
                ? "#fde68a"
                : "#bbf7d0",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "600" }}>
            Impulse / Trigger Spend:
          </span>
          <strong
            style={{
              fontSize: "0.95rem",
              color:
                data.triggerPercentage > 25
                  ? "#dc2626"
                  : data.triggerPercentage > 10
                  ? "#b45309"
                  : "#16a34a",
            }}
          >
            {data.triggerPercentage}% ({formatCurrency(data.triggerSpendingAmount)})
          </strong>
        </div>
      </div>

      {/* Main Grid: Chart + Mood breakdown bars */}
      <div style={s.gridRow}>
        {/* Left: Donut Chart */}
        <div style={s.chartBox}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{
                    background: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "0.85rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "50px 0" }}>
              No chart data
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "-10px" }}>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Total Analyzed: <strong>{formatCurrency(data.totalSpent)}</strong>
            </span>
          </div>
        </div>

        {/* Right: Mood Progress Breakdown */}
        <div style={s.barsBox}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(data.moodBreakdown || []).map((m) => {
              const meta = MOOD_META[m.mood] || MOOD_META.Other;
              return (
                <div key={m.mood} style={{ fontSize: "0.86rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{meta.emoji}</span>
                      <strong style={{ color: "#1e293b" }}>{meta.label}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        ({m.count} purchases)
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: "#0f172a", marginRight: "6px" }}>
                        {formatCurrency(m.totalAmount)}
                      </strong>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        ({m.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={s.progressTrack}>
                    <div
                      style={{
                        ...s.progressBar,
                        width: `${m.percentage}%`,
                        background: meta.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Behavioral Insights Cards */}
      {data.insights && data.insights.length > 0 && (
        <div style={s.insightsBox}>
          <h4 style={s.insightsHeader}>🧠 Behavioral Spending Insights</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
            {data.insights.map((ins, i) => (
              <div
                key={i}
                style={{
                  ...s.insightCard,
                  background:
                    ins.type === "warning"
                      ? "#fff1f2"
                      : ins.type === "caution"
                      ? "#fffbeb"
                      : ins.type === "success"
                      ? "#ecfdf5"
                      : "#f8fafc",
                  borderColor:
                    ins.type === "warning"
                      ? "#fecdd3"
                      : ins.type === "caution"
                      ? "#fef08a"
                      : ins.type === "success"
                      ? "#a7f3d0"
                      : "#e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span>
                    {ins.type === "warning" ? "⚡" : ins.type === "caution" ? "😫" : ins.type === "success" ? "🎯" : "💡"}
                  </span>
                  <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>
                    {ins.title}
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569", lineHeight: "1.4" }}>
                  {ins.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    marginBottom: "24px",
    fontFamily: "'Inter', sans-serif",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#0f172a",
    fontFamily: "'Sora', sans-serif",
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "0.88rem",
    color: "#64748b",
  },
  triggerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "12px",
    border: "1px solid",
  },
  gridRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1.6fr",
    gap: "24px",
    alignItems: "center",
  },
  chartBox: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "12px",
    border: "1px solid #e2e8f0",
  },
  barsBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  progressTrack: {
    height: "7px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },
  insightsBox: {
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #f1f5f9",
  },
  insightsHeader: {
    margin: "0 0 12px 0",
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "'Sora', sans-serif",
  },
  insightCard: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid",
  },
};

export default MoodSpendingWidget;
