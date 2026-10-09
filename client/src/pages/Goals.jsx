import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/finance";

const CATEGORIES = [
  { label: "Emergency", icon: "🛡️", color: "#10b981" },
  { label: "Gadget & Tech", icon: "💻", color: "#3b82f6" },
  { label: "Travel & Vacation", icon: "✈️", color: "#f59e0b" },
  { label: "Vehicle", icon: "🚗", color: "#8b5cf6" },
  { label: "Education", icon: "🎓", color: "#06b6d4" },
  { label: "Home & Family", icon: "🏡", color: "#ec4899" },
  { label: "General", icon: "🎯", color: "#1a2ea8" },
];

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    category: "Gadget & Tech",
    targetDate: "",
    color: "#3b82f6",
    icon: "💻",
  });

  const fetchGoals = async () => {
    try {
      const res = await API.get("/api/goals");
      setGoals(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load savings goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      return toast.error("Please fill in title, target amount, and deadline");
    }

    try {
      await API.post("/api/goals", {
        ...formData,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
      });
      toast.success("Savings Goal created! 🎯");
      setShowCreateModal(false);
      setFormData({
        title: "",
        targetAmount: "",
        currentAmount: "",
        category: "Gadget & Tech",
        targetDate: "",
        color: "#3b82f6",
        icon: "💻",
      });
      fetchGoals();
    } catch {
      toast.error("Failed to create goal");
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      return toast.error("Enter a valid deposit amount");
    }

    try {
      await API.post(`/api/goals/${depositGoal._id}/deposit`, {
        amount,
        note: depositNote || "Savings Deposit",
      });
      toast.success(`Deposited ${formatCurrency(amount)} into ${depositGoal.title}! 🎉`);
      setDepositGoal(null);
      setDepositAmount("");
      setDepositNote("");
      fetchGoals();
    } catch {
      toast.error("Failed to deposit funds");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this savings goal?")) return;
    try {
      await API.delete(`/api/goals/${id}`);
      toast.success("Goal deleted");
      fetchGoals();
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  // Aggregated Stats
  const totalTarget = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
  const completedCount = goals.filter((g) => g.isCompleted || g.percentage >= 100).length;
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div style={s.pageWrapper}>
      <main style={s.mainContainer}>
        {/* Top Header */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>🎯 Savings Goals & Milestones</h1>
            <p style={s.subtitle}>
              Set long-term targets, track savings velocity, and reach milestones.
            </p>
          </div>
          <button style={s.primaryBtn} onClick={() => setShowCreateModal(true)}>
            + Create New Goal
          </button>
        </div>

        {/* Overview Stat Cards */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={{ ...s.statIconCircle, background: "#dbeafe" }}>🎯</div>
            <div>
              <p style={s.statLabel}>Total Target</p>
              <p style={s.statValue}>{formatCurrency(totalTarget)}</p>
            </div>
          </div>

          <div style={s.statCard}>
            <div style={{ ...s.statIconCircle, background: "#dcfce7" }}>🏦</div>
            <div>
              <p style={s.statLabel}>Total Saved</p>
              <p style={{ ...s.statValue, color: "#16a34a" }}>{formatCurrency(totalSaved)}</p>
            </div>
          </div>

          <div style={s.statCard}>
            <div style={{ ...s.statIconCircle, background: "#fef3c7" }}>📈</div>
            <div>
              <p style={s.statLabel}>Overall Completion</p>
              <p style={s.statValue}>{overallPct}%</p>
            </div>
          </div>

          <div style={s.statCard}>
            <div style={{ ...s.statIconCircle, background: "#f3e8ff" }}>🏆</div>
            <div>
              <p style={s.statLabel}>Completed Goals</p>
              <p style={s.statValue}>{completedCount} of {goals.length}</p>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {loading ? (
          <div style={s.emptyState}>Loading your savings goals...</div>
        ) : goals.length === 0 ? (
          <div style={s.emptyCard}>
            <span style={{ fontSize: "3rem" }}>🎯</span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1a1a2e", margin: "12px 0 6px" }}>
              No Savings Goals Created Yet
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.88rem", maxWidth: "420px", marginBottom: "20px" }}>
              Start by creating a goal for your emergency fund, a new laptop, or your next vacation!
            </p>
            <button style={s.primaryBtn} onClick={() => setShowCreateModal(true)}>
              + Create Your First Goal
            </button>
          </div>
        ) : (
          <div style={s.goalsGrid}>
            {goals.map((g) => {
              const isDone = g.isCompleted || g.percentage >= 100;
              return (
                <div key={g._id} style={{ ...s.goalCard, borderColor: isDone ? "#86efac" : "#e2e8f0" }}>
                  {/* Card Header */}
                  <div style={s.cardTop}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={s.goalIcon}>{g.icon || "🎯"}</span>
                      <div>
                        <h3 style={s.goalTitle}>{g.title}</h3>
                        <span style={s.categoryBadge}>{g.category}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        ...s.statusBadge,
                        background: isDone ? "#dcfce7" : g.daysLeft < 30 ? "#fef3c7" : "#e0f2fe",
                        color: isDone ? "#15803d" : g.daysLeft < 30 ? "#b45309" : "#0369a1",
                      }}
                    >
                      {isDone ? "🏆 Completed" : g.status}
                    </span>
                  </div>

                  {/* Amounts & Percentage */}
                  <div style={s.amountRow}>
                    <div>
                      <p style={s.savedAmount}>{formatCurrency(g.currentAmount)}</p>
                      <p style={s.targetLabel}>saved of {formatCurrency(g.targetAmount)}</p>
                    </div>
                    <div style={s.pctTag}>{g.percentage}%</div>
                  </div>

                  {/* Progress Bar */}
                  <div style={s.progressTrack}>
                    <div
                      style={{
                        ...s.progressFill,
                        width: `${g.percentage}%`,
                        background: isDone
                          ? "linear-gradient(90deg, #10b981, #059669)"
                          : "linear-gradient(90deg, #1a2ea8, #3b82f6)",
                      }}
                    />
                  </div>

                  {/* Metrics Footer */}
                  <div style={s.metricsRow}>
                    <div>
                      <span style={s.metricLabel}>Remaining:</span>
                      <span style={s.metricValue}>{formatCurrency(g.remainingAmount)}</span>
                    </div>
                    <div>
                      <span style={s.metricLabel}>Target:</span>
                      <span style={s.metricValue}>
                        {new Date(g.targetDate).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {!isDone && g.requiredMonthlySaving > 0 && (
                    <div style={s.suggestionPill}>
                      💡 Need {formatCurrency(g.requiredMonthlySaving)}/month to finish on schedule
                    </div>
                  )}

                  {/* Card Actions */}
                  <div style={s.actionRow}>
                    <button
                      style={s.depositBtn}
                      onClick={() => setDepositGoal(g)}
                      disabled={isDone}
                    >
                      {isDone ? "Goal Achieved 🎉" : "💵 Deposit Savings"}
                    </button>
                    <button style={s.deleteBtn} onClick={() => handleDelete(g._id)} title="Delete Goal">
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Deposit Funds Modal */}
        {depositGoal && (
          <div style={s.modalOverlay} onClick={() => setDepositGoal(null)}>
            <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
              <h3 style={s.modalTitle}>💵 Deposit Funds</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "4px 0 16px" }}>
                Add savings towards: <strong>{depositGoal.title}</strong>
              </p>

              <form onSubmit={handleDepositSubmit}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={s.formLabel}>Amount (₹)</label>
                  <input
                    type="number"
                    style={s.formInput}
                    placeholder="e.g. 2000"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={s.formLabel}>Note (Optional)</label>
                  <input
                    type="text"
                    style={s.formInput}
                    placeholder="e.g. Salary bonus deposit"
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button type="button" style={s.cancelBtn} onClick={() => setDepositGoal(null)}>
                    Cancel
                  </button>
                  <button type="submit" style={s.primaryBtn}>
                    Confirm Deposit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Goal Modal */}
        {showCreateModal && (
          <div style={s.modalOverlay} onClick={() => setShowCreateModal(false)}>
            <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
              <h3 style={s.modalTitle}>🎯 Create New Savings Goal</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "4px 0 16px" }}>
                Define what you're saving for and set your target date.
              </p>

              <form onSubmit={handleCreateSubmit}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={s.formLabel}>Goal Title *</label>
                  <input
                    type="text"
                    style={s.formInput}
                    placeholder="e.g. MacBook Pro M3, Emergency Cushion"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={s.formLabel}>Target Amount (₹) *</label>
                    <input
                      type="number"
                      style={s.formInput}
                      placeholder="e.g. 75000"
                      min="1"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={s.formLabel}>Already Saved (₹)</label>
                    <input
                      type="number"
                      style={s.formInput}
                      placeholder="0"
                      min="0"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={s.formLabel}>Category</label>
                    <select
                      style={s.formInput}
                      value={formData.category}
                      onChange={(e) => {
                        const sel = CATEGORIES.find((c) => c.label === e.target.value);
                        setFormData({
                          ...formData,
                          category: e.target.value,
                          icon: sel?.icon || "🎯",
                          color: sel?.color || "#1a2ea8",
                        });
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.label} value={c.label}>
                          {c.icon} {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={s.formLabel}>Target Deadline *</label>
                    <input
                      type="date"
                      style={s.formInput}
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "18px" }}>
                  <button type="button" style={s.cancelBtn} onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={s.primaryBtn}>
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const s = {
  pageWrapper: {
    background: "#eef0f7",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  mainContainer: {
    maxWidth: "1140px",
    margin: "0 auto",
    padding: "28px 24px 60px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "14px",
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.85rem",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "#64748b",
    marginTop: "4px",
  },
  primaryBtn: {
    background: "#1a2ea8",
    color: "white",
    border: "none",
    padding: "10px 22px",
    borderRadius: "10px",
    fontSize: "0.88rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(26,46,168,0.2)",
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "0.86rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  statCard: {
    background: "white",
    borderRadius: "14px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
  },
  statIconCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
  },
  statLabel: {
    fontSize: "0.76rem",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    margin: 0,
  },
  statValue: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: "2px 0 0",
  },
  goalsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  goalCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    border: "1.5px solid #e2e8f0",
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  goalIcon: {
    fontSize: "1.7rem",
    background: "#f8fafc",
    padding: "8px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  goalTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
  },
  categoryBadge: {
    fontSize: "0.72rem",
    fontWeight: "600",
    color: "#64748b",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.72rem",
    fontWeight: "700",
  },
  amountRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  savedAmount: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.45rem",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: 0,
  },
  targetLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    margin: "2px 0 0",
  },
  pctTag: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#1a2ea8",
  },
  progressTrack: {
    width: "100%",
    height: "9px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },
  metricsRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.78rem",
    color: "#64748b",
    borderTop: "1px dashed #f1f5f9",
    paddingTop: "10px",
  },
  metricLabel: {
    color: "#94a3b8",
    marginRight: "4px",
  },
  metricValue: {
    fontWeight: "600",
    color: "#334155",
  },
  suggestionPill: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "0.75rem",
    color: "#1d4ed8",
    fontWeight: "600",
  },
  actionRow: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
  },
  depositBtn: {
    flex: 1,
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "0.82rem",
    fontWeight: "700",
    color: "#1a2ea8",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#fee2e2",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalCard: {
    background: "white",
    borderRadius: "18px",
    padding: "28px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  },
  modalTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: 0,
  },
  formLabel: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "5px",
  },
  formInput: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.88rem",
    boxSizing: "border-box",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
  },
  emptyCard: {
    background: "white",
    borderRadius: "18px",
    padding: "50px 20px",
    textAlign: "center",
    border: "1px dashed #cbd5e1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};

export default Goals;
