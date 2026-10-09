import React, { useState, useEffect } from "react";
import API from "../api/axios";

const FinancialHealthWidget = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await API.get("/api/analytics/financial-health");
      if (res.data && res.data.pillars && typeof res.data.pillars === "object") {
        setHealthData(res.data);
      }
    } catch (err) {
      console.warn("Failed to load financial health score", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "120px",
          color: "#94a3b8",
          fontSize: "0.85rem",
        }}
      >
        Calculating Financial Health Index...
      </div>
    );
  }

  if (!healthData || !healthData.pillars || typeof healthData.pillars !== "object") {
    return null;
  }

  const { score = 0, grade = "B", tier = "Good", color = "#3b82f6", pillars = {}, actionableTips = [] } = healthData;
  const tips = Array.isArray(actionableTips) ? actionableTips : [];

  const getPillarColor = (sc, max) => {
    const pct = sc / max;
    if (pct >= 0.8) return "#10b981"; // green
    if (pct >= 0.6) return "#3b82f6"; // blue
    if (pct >= 0.4) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Header & Top Overview */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.25rem" }}>🛡️</span>
            <h3
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "#1a1a2e",
                margin: 0,
              }}
            >
              Financial Health Index
            </h3>
          </div>
          <p
            style={{
              fontSize: "0.82rem",
              color: "#64748b",
              margin: "4px 0 0",
            }}
          >
            Real-time evaluation of your savings, budget discipline, and financial safety.
          </p>
        </div>

        {/* Score Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "#f8fafc",
            padding: "8px 18px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "1.8rem",
                fontWeight: "800",
                color: color || "#1a2ea8",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {score}
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#94a3b8" }}>
                /100
              </span>
            </p>
            <p
              style={{
                fontSize: "0.74rem",
                fontWeight: "700",
                color: "#64748b",
                margin: "4px 0 0",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Grade {grade} • {tier}
            </p>
          </div>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: color || "#3b82f6",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Sora', sans-serif",
              fontSize: "1.2rem",
              fontWeight: "800",
            }}
          >
            {grade}
          </div>
        </div>
      </div>

      {/* 4 Pillars Progress Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "14px",
        }}
      >
        {Object.entries(pillars).map(([key, item]) => {
          const pillColor = getPillarColor(item.score, item.max);
          const percent = Math.round((item.score / item.max) * 100);
          return (
            <div
              key={key}
              style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "14px 16px",
                border: "1px solid #edf2f7",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: "800",
                    color: pillColor,
                  }}
                >
                  {item.score}/{item.max}
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "#e2e8f0",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: pillColor,
                    borderRadius: "999px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={item.details}
              >
                {item.details}
              </p>
            </div>
          );
        })}
      </div>

      {/* Actionable Recommendations */}
      {actionableTips?.length > 0 && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.9rem" }}>💡</span>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: "700",
                color: "#166534",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Actionable Steps to Boost Your Score
            </span>
          </div>
          {actionableTips.map((tip, idx) => (
            <p
              key={idx}
              style={{
                fontSize: "0.8rem",
                color: "#15803d",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              • {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialHealthWidget;
