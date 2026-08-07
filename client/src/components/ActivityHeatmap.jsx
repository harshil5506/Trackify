import { useState, useEffect } from "react";
import API from "../api/axios";
import { formatCurrency } from "../utils/finance";

const ActivityHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCell, setActiveCell] = useState(null);
  const [daysRange, setDaysRange] = useState(180); // Default to last 180 days

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/analytics/heatmap");
      setHeatmapData(data?.activity || {});
    } catch (err) {
      console.error("Failed to load heatmap data", err);
    } finally {
      setLoading(false);
    }
  };

  const generateDates = (daysCount) => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    return dates;
  };

  const dates = generateDates(daysRange);

  const columns = [];
  let currentCol = [];

  if (dates.length > 0) {
    const firstDayOfWeek = dates[0].getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentCol.push(null);
    }
  }

  dates.forEach((date) => {
    currentCol.push(date);
    if (currentCol.length === 7) {
      columns.push(currentCol);
      currentCol = [];
    }
  });
  if (currentCol.length > 0) {
    while (currentCol.length < 7) {
      currentCol.push(null);
    }
    columns.push(currentCol);
  }

  const getLevel = (cellData) => {
    if (!cellData || cellData.count === 0) return 0;
    if (cellData.count === 1) return 1;
    if (cellData.count <= 3) return 2;
    if (cellData.count <= 5) return 3;
    return 4;
  };

  const levelColors = [
    "#ebedf0",
    "#9be9a8",
    "#40c463",
    "#30a14e",
    "#216e39",
  ];

  let activeDaysCount = 0;
  let totalTransactions = 0;
  let totalSpent = 0;

  Object.values(heatmapData).forEach((item) => {
    if (item.count > 0) {
      activeDaysCount++;
      totalTransactions += item.count;
      totalSpent += item.totalExpense || 0;
    }
  });

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>🔥 Activity Heatmap</h3>
          <p style={styles.subtitle}>
            Financial activity frequency over time ({daysRange} days overview)
          </p>
        </div>
        <div style={styles.controls}>
          {[90, 180, 365].map((range) => (
            <button
              key={range}
              onClick={() => setDaysRange(range)}
              style={{
                ...styles.rangeBtn,
                ...(daysRange === range ? styles.activeRangeBtn : {}),
              }}
            >
              {range === 365 ? "1 Year" : `${range} Days`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading heatmap activity...</div>
      ) : (
        <>
          <div style={styles.gridContainer}>
            <div style={styles.dayLabels}>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div style={styles.gridWrapper}>
              <div style={styles.grid}>
                {columns.map((col, colIdx) => (
                  <div key={colIdx} style={styles.column}>
                    {col.map((date, rowIdx) => {
                      if (!date) {
                        return <div key={rowIdx} style={styles.emptySquare} />;
                      }
                      const dateStr = date.toISOString().split("T")[0];
                      const data = heatmapData[dateStr] || { count: 0, totalExpense: 0, totalIncome: 0 };
                      const level = getLevel(data);

                      return (
                        <div
                          key={rowIdx}
                          onMouseEnter={() => setActiveCell({ date: dateStr, data })}
                          onMouseLeave={() => setActiveCell(null)}
                          style={{
                            ...styles.square,
                            backgroundColor: levelColors[level],
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <div style={styles.statsRow}>
              <span style={styles.statBadge}>
                Active Days: <strong>{activeDaysCount}</strong>
              </span>
              <span style={styles.statBadge}>
                Total Actions: <strong>{totalTransactions}</strong>
              </span>
              <span style={styles.statBadge}>
                Total Spent: <strong>{formatCurrency(totalSpent)}</strong>
              </span>
            </div>

            <div style={styles.legend}>
              <span style={{ fontSize: "12px", color: "#666" }}>Less</span>
              {levelColors.map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "2px",
                    backgroundColor: color,
                  }}
                />
              ))}
              <span style={{ fontSize: "12px", color: "#666" }}>More</span>
            </div>
          </div>

          {activeCell && (
            <div style={styles.tooltipBox}>
              <strong>{activeCell.date}</strong>: {activeCell.data.count} transaction(s)
              {activeCell.data.totalExpense > 0 && ` · Spent: ${formatCurrency(activeCell.data.totalExpense)}`}
              {activeCell.data.totalIncome > 0 && ` · Income: ${formatCurrency(activeCell.data.totalIncome)}`}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
    border: "1px solid #e2e8f0",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
    fontFamily: "'Sora', sans-serif",
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: 0,
  },
  controls: {
    display: "flex",
    gap: "8px",
  },
  rangeBtn: {
    background: "#f1f5f9",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activeRangeBtn: {
    background: "#1a2ea8",
    color: "#ffffff",
  },
  loading: {
    textAlign: "center",
    padding: "30px",
    color: "#64748b",
    fontSize: "14px",
  },
  gridContainer: {
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    paddingBottom: "12px",
  },
  dayLabels: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#94a3b8",
    paddingTop: "2px",
    paddingBottom: "2px",
  },
  gridWrapper: {
    flex: 1,
    overflowX: "auto",
  },
  grid: {
    display: "flex",
    gap: "3px",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  square: {
    width: "12px",
    height: "12px",
    borderRadius: "2px",
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },
  emptySquare: {
    width: "12px",
    height: "12px",
    backgroundColor: "transparent",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  statsRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  statBadge: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#334155",
  },
  legend: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  tooltipBox: {
    marginTop: "12px",
    background: "#1e293b",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "12px",
  },
};

export default ActivityHeatmap;
