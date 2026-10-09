import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/finance";

const POPULAR_PRESETS = [
  { name: "Netflix", amount: 649, category: "Entertainment", icon: "🎬", color: "#e50914" },
  { name: "Spotify", amount: 119, category: "Entertainment", icon: "🎵", color: "#1db954" },
  { name: "Amazon Prime", amount: 299, category: "Entertainment", icon: "📦", color: "#00a8e1" },
  { name: "YouTube Premium", amount: 149, category: "Entertainment", icon: "▶️", color: "#ff0000" },
  { name: "Gym Membership", amount: 1500, category: "Healthcare", icon: "💪", color: "#f97316" },
  { name: "Wi-Fi / Fiber", amount: 899, category: "Bills & Utilities", icon: "🌐", color: "#06b6d4" },
  { name: "House Rent", amount: 12000, category: "Rent", icon: "🏠", color: "#6366f1" },
  { name: "ChatGPT Plus", amount: 1999, category: "Bills & Utilities", icon: "🤖", color: "#10a37f" },
  { name: "Apple iCloud", amount: 75, category: "Bills & Utilities", icon: "☁️", color: "#64748b" },
];

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({
    totalSubscriptions: 0,
    activeCount: 0,
    totalMonthlyBurn: 0,
    totalYearlyBurn: 0,
    dueThisWeekCount: 0,
    dueSoonItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetectModal, setShowDetectModal] = useState(false);
  const [detectedList, setDetectedList] = useState([]);
  const [selectedDetected, setSelectedDetected] = useState({});
  const [detectingLoading, setDetectingLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    billingCycle: "monthly",
    category: "Entertainment",
    nextBillingDate: "",
    paymentMethod: "UPI / Auto-Debit",
    icon: "📱",
    color: "#1a2ea8",
    notes: "",
  });

  const fetchSubscriptions = async () => {
    try {
      const res = await API.get("/api/subscriptions");
      setSubscriptions(res.data.subscriptions || []);
      setSummary(
        res.data.summary || {
          totalSubscriptions: 0,
          activeCount: 0,
          totalMonthlyBurn: 0,
          totalYearlyBurn: 0,
          dueThisWeekCount: 0,
          dueSoonItems: [],
        }
      );
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.nextBillingDate) {
      return toast.error("Please fill in name, amount, and next billing date");
    }

    try {
      await API.post("/api/subscriptions", formData);
      toast.success("Subscription added! 🔔");
      setShowAddModal(false);
      setFormData({
        name: "",
        amount: "",
        billingCycle: "monthly",
        category: "Entertainment",
        nextBillingDate: "",
        paymentMethod: "UPI / Auto-Debit",
        icon: "📱",
        color: "#1a2ea8",
        notes: "",
      });
      fetchSubscriptions();
    } catch {
      toast.error("Failed to save subscription");
    }
  };

  const handleApplyPreset = (preset) => {
    // Tomorrow or next month date
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    const dateStr = d.toISOString().split("T")[0];

    setFormData({
      ...formData,
      name: preset.name,
      amount: preset.amount,
      category: preset.category,
      icon: preset.icon,
      color: preset.color,
      nextBillingDate: dateStr,
    });
  };

  const handleRenew = async (id, name) => {
    try {
      await API.post(`/api/subscriptions/${id}/renew`, { recordExpense: true });
      toast.success(`Marked ${name} as paid! Next due date updated 🎉`);
      fetchSubscriptions();
    } catch {
      toast.error("Failed to renew subscription");
    }
  };

  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === "active" ? "paused" : "active";
    try {
      await API.put(`/api/subscriptions/${sub._id}`, { status: newStatus });
      toast.success(`Subscription marked as ${newStatus}`);
      fetchSubscriptions();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription?")) return;
    try {
      await API.delete(`/api/subscriptions/${id}`);
      toast.success("Subscription removed");
      fetchSubscriptions();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Smart Auto-Detect
  const handleScanExpenses = async () => {
    setDetectingLoading(true);
    setShowDetectModal(true);
    try {
      const res = await API.get("/api/subscriptions/detect");
      const list = res.data.detectedSubscriptions || [];
      setDetectedList(list);

      // Pre-select all
      const initialMap = {};
      list.forEach((_, idx) => {
        initialMap[idx] = true;
      });
      setSelectedDetected(initialMap);

      if (list.length === 0) {
        toast("No new recurring subscriptions detected in past expenses.", {
          icon: "ℹ️",
        });
      } else {
        toast.success(`Found ${list.length} recurring payment(s)! 🎯`);
      }
    } catch {
      toast.error("Could not run scanner");
    } finally {
      setDetectingLoading(false);
    }
  };

  const handleImportSelected = async () => {
    const toImport = detectedList.filter((_, idx) => selectedDetected[idx]);
    if (toImport.length === 0) {
      return toast.error("Please select at least one item to import");
    }

    try {
      await API.post("/api/subscriptions/import-detected", { items: toImport });
      toast.success(`Imported ${toImport.length} subscription(s)! 🚀`);
      setShowDetectModal(false);
      fetchSubscriptions();
    } catch {
      toast.error("Failed to import");
    }
  };

  // Filtering
  const filteredSubs = subscriptions.filter((s) => {
    if (activeFilter === "active") return s.status === "active";
    if (activeFilter === "due_soon") return s.daysLeft >= 0 && s.daysLeft <= 7;
    if (activeFilter === "paused") return s.status === "paused";
    return true;
  });

  return (
    <div style={s.container}>
      <div style={s.inner}>
        {/* Header Section */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.pageTitle}>Recurring Subscriptions & Fixed Expenses</h1>
            <p style={s.pageSub}>
              Track your regular bills, streaming services, and fixed commitments to stay ahead of renewals.
            </p>
          </div>
          <div style={s.actionsRow}>
            <button
              onClick={handleScanExpenses}
              style={s.scanBtn}
              title="Automatically scan past transactions for repeating payments"
            >
              ✨ Scan My Expenses
            </button>
            <button onClick={() => setShowAddModal(true)} style={s.addBtn}>
              + Add Subscription
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div style={s.statsGrid}>
          <div style={{ ...s.statCard, background: "linear-gradient(135deg,#1e1b4b,#312e81)" }}>
            <span style={s.statEmoji}>💳</span>
            <div>
              <p style={s.statLabel}>Monthly Fixed Burn</p>
              <h2 style={s.statVal}>{formatCurrency(summary.totalMonthlyBurn)}</h2>
              <span style={s.statHint}>Regular monthly commitment</span>
            </div>
          </div>

          <div style={{ ...s.statCard, background: "linear-gradient(135deg,#064e3b,#047857)" }}>
            <span style={s.statEmoji}>📅</span>
            <div>
              <p style={s.statLabel}>Annual Projected Cost</p>
              <h2 style={s.statVal}>{formatCurrency(summary.totalYearlyBurn)}</h2>
              <span style={s.statHint}>12-month normalized total</span>
            </div>
          </div>

          <div style={{ ...s.statCard, background: "linear-gradient(135deg,#78350f,#d97706)" }}>
            <span style={s.statEmoji}>🔔</span>
            <div>
              <p style={s.statLabel}>Due This Week</p>
              <h2 style={s.statVal}>{summary.dueThisWeekCount}</h2>
              <span style={s.statHint}>
                {summary.dueThisWeekCount > 0
                  ? "Requires payment soon"
                  : "All clear for the next 7 days"}
              </span>
            </div>
          </div>

          <div style={{ ...s.statCard, background: "linear-gradient(135deg,#1f2937,#374151)" }}>
            <span style={s.statEmoji}>📋</span>
            <div>
              <p style={s.statLabel}>Active Services</p>
              <h2 style={s.statVal}>{summary.activeCount}</h2>
              <span style={s.statHint}>Out of {summary.totalSubscriptions} total services</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={s.filterBar}>
          {[
            { id: "all", label: `All (${subscriptions.length})` },
            { id: "due_soon", label: `Due Soon (${summary.dueThisWeekCount})` },
            { id: "active", label: `Active (${summary.activeCount})` },
            { id: "paused", label: "Paused" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                ...s.filterTab,
                ...(activeFilter === tab.id ? s.filterTabActive : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={s.emptyBox}>
            <p>Loading subscriptions...</p>
          </div>
        ) : filteredSubs.length === 0 ? (
          <div style={s.emptyBox}>
            <span style={{ fontSize: "3rem" }}>📺</span>
            <h3 style={{ margin: "14px 0 6px 0", color: "#1e293b" }}>
              No subscriptions found in this view
            </h3>
            <p style={{ color: "#64748b", maxWidth: "420px", margin: "0 auto 20px auto" }}>
              Keep tabs on streaming platforms, gym fees, or rent payments to prevent unexpected renewals.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={handleScanExpenses} style={s.scanBtn}>
                ✨ Scan Expenses Automatically
              </button>
              <button onClick={() => setShowAddModal(true)} style={s.addBtn}>
                + Add One Manually
              </button>
            </div>
          </div>
        ) : (
          <div style={s.grid}>
            {filteredSubs.map((sub) => {
              const isOverdue = sub.daysLeft < 0;
              const isDueSoon = sub.daysLeft >= 0 && sub.daysLeft <= 3;
              const isDueThisWeek = sub.daysLeft > 3 && sub.daysLeft <= 7;

              return (
                <div key={sub._id} style={s.card}>
                  {/* Top Bar */}
                  <div style={s.cardHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          ...s.iconBadge,
                          background: `${sub.color}20`,
                          borderColor: `${sub.color}40`,
                        }}
                      >
                        <span style={{ fontSize: "1.4rem" }}>{sub.icon || "📱"}</span>
                      </div>
                      <div>
                        <h3 style={s.subName}>{sub.name}</h3>
                        <span style={s.subCat}>{sub.category}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        ...s.statusBadge,
                        background:
                          sub.status === "active"
                            ? isOverdue
                              ? "#fee2e2"
                              : isDueSoon
                              ? "#fef3c7"
                              : "#dcfce7"
                            : "#f1f5f9",
                        color:
                          sub.status === "active"
                            ? isOverdue
                              ? "#dc2626"
                              : isDueSoon
                              ? "#b45309"
                              : "#16a34a"
                            : "#64748b",
                      }}
                    >
                      {sub.status === "active"
                        ? isOverdue
                          ? "Overdue"
                          : isDueSoon
                          ? "Due Soon"
                          : "Active"
                        : "Paused"}
                    </span>
                  </div>

                  {/* Pricing info */}
                  <div style={s.priceBlock}>
                    <div>
                      <div style={s.priceAmount}>{formatCurrency(sub.amount)}</div>
                      <div style={s.priceCycle}>per {sub.billingCycle}</div>
                    </div>
                    {sub.billingCycle !== "monthly" && (
                      <div style={s.monthlyEquiv}>
                        ~{formatCurrency(sub.monthlyNormalized)}/mo
                      </div>
                    )}
                  </div>

                  {/* Due date info box */}
                  <div
                    style={{
                      ...s.dueBox,
                      background: isOverdue ? "#fff1f2" : isDueSoon ? "#fffbeb" : "#f8fafc",
                      borderColor: isOverdue ? "#fecdd3" : isDueSoon ? "#fef08a" : "#e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", color: "#475569" }}>Next Billing:</span>
                      <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>
                        {new Date(sub.nextBillingDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Status:</span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          color: isOverdue ? "#e11d48" : isDueSoon ? "#d97706" : isDueThisWeek ? "#2563eb" : "#059669",
                        }}
                      >
                        {isOverdue
                          ? `Passed ${Math.abs(sub.daysLeft)} days ago`
                          : sub.daysLeft === 0
                          ? "Due Today! ⚠️"
                          : sub.daysLeft === 1
                          ? "Due Tomorrow! ⚠️"
                          : `Due in ${sub.daysLeft} days`}
                      </span>
                    </div>
                  </div>

                  {/* Payment & notes */}
                  <div style={s.cardMetaRow}>
                    <span>💳 {sub.paymentMethod}</span>
                    {sub.autoDetected && <span style={s.autoTag}>✨ Auto-detected</span>}
                  </div>

                  {/* Action buttons */}
                  <div style={s.cardActions}>
                    <button
                      onClick={() => handleRenew(sub._id, sub.name)}
                      style={s.renewBtn}
                      title="Advance to next billing cycle and log paid expense"
                    >
                      ✓ Mark Paid
                    </button>
                    <button
                      onClick={() => handleToggleStatus(sub)}
                      style={s.pauseBtn}
                    >
                      {sub.status === "active" ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={() => handleDelete(sub._id)}
                      style={s.deleteBtn}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Subscription Modal */}
        {showAddModal && (
          <div style={s.modalOverlay}>
            <div style={s.modalContent}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>Add Recurring Subscription</h2>
                <button onClick={() => setShowAddModal(false)} style={s.closeBtn}>
                  ✕
                </button>
              </div>

              {/* Quick Presets */}
              <div style={{ marginBottom: "18px" }}>
                <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0 0 8px 0", fontWeight: "600" }}>
                  QUICK PRESETS:
                </p>
                <div style={s.presetWrap}>
                  {POPULAR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      style={s.presetPill}
                    >
                      {p.icon} {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} style={s.form}>
                <div style={s.formGroup}>
                  <label style={s.label}>Service / Commitment Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Netflix, Gym, House Rent, Fiber Wi-Fi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={s.input}
                  />
                </div>

                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Amount (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 649"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      min="1"
                      style={s.input}
                    />
                  </div>

                  <div style={s.formGroup}>
                    <label style={s.label}>Billing Cycle</label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                      style={s.select}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Next Billing Date *</label>
                    <input
                      type="date"
                      value={formData.nextBillingDate}
                      onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                      required
                      style={s.input}
                    />
                  </div>

                  <div style={s.formGroup}>
                    <label style={s.label}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={s.select}
                    >
                      <option value="Entertainment">Entertainment</option>
                      <option value="Bills & Utilities">Bills & Utilities</option>
                      <option value="Rent">Rent</option>
                      <option value="Healthcare">Healthcare & Gym</option>
                      <option value="Education">Education & Courses</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Payment Method</label>
                    <input
                      type="text"
                      placeholder="e.g. Credit Card, UPI Autopay"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      style={s.input}
                    />
                  </div>

                  <div style={s.formGroup}>
                    <label style={s.label}>Icon Emoji</label>
                    <input
                      type="text"
                      placeholder="e.g. 🎬"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      style={s.input}
                    />
                  </div>
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Optional Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Shared with roommates, annual discount"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={s.input}
                  />
                </div>

                <div style={s.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={s.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={s.submitBtn}>
                    Save Subscription 🔔
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Smart Auto-Detect Modal */}
        {showDetectModal && (
          <div style={s.modalOverlay}>
            <div style={{ ...s.modalContent, maxWidth: "600px" }}>
              <div style={s.modalHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.4rem" }}>✨</span>
                  <h2 style={s.modalTitle}>Smart Subscription Detector</h2>
                </div>
                <button onClick={() => setShowDetectModal(false)} style={s.closeBtn}>
                  ✕
                </button>
              </div>

              <p style={{ color: "#475569", fontSize: "0.9rem", margin: "0 0 16px 0" }}>
                We scanned your past transactions for recurring services, streaming platforms, and repeating monthly payments.
              </p>

              {detectingLoading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  <p>Analyzing transaction history...</p>
                </div>
              ) : detectedList.length === 0 ? (
                <div style={{ padding: "30px 10px", textAlign: "center", color: "#64748b" }}>
                  <p style={{ fontSize: "1rem", fontWeight: "600", color: "#1e293b" }}>
                    No recurring patterns detected yet
                  </p>
                  <p style={{ fontSize: "0.85rem", marginTop: "6px" }}>
                    Add more expenses (like Netflix, Rent, Wi-Fi) or add your subscription manually!
                  </p>
                  <button
                    onClick={() => {
                      setShowDetectModal(false);
                      setShowAddModal(true);
                    }}
                    style={{ ...s.addBtn, marginTop: "16px" }}
                  >
                    + Add Subscription Manually
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
                    {detectedList.map((item, idx) => (
                      <label
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          borderRadius: "10px",
                          border: selectedDetected[idx] ? "2px solid #1a2ea8" : "1px solid #e2e8f0",
                          background: selectedDetected[idx] ? "#eff4fe" : "#f8fafc",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedDetected[idx]}
                          onChange={(e) =>
                            setSelectedDetected({
                              ...selectedDetected,
                              [idx]: e.target.checked,
                            })
                          }
                          style={{ width: "18px", height: "18px", accentColor: "#1a2ea8" }}
                        />
                        <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>
                              {item.name}
                            </strong>
                            <strong style={{ color: "#1a2ea8", fontSize: "0.95rem" }}>
                              {formatCurrency(item.amount)}/mo
                            </strong>
                          </div>
                          <p style={{ margin: "3px 0 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                            {item.reason}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div style={{ ...s.modalActions, marginTop: "20px" }}>
                    <button
                      onClick={() => setShowDetectModal(false)}
                      style={s.cancelBtn}
                    >
                      Dismiss
                    </button>
                    <button onClick={handleImportSelected} style={s.submitBtn}>
                      Import Selected ({Object.values(selectedDetected).filter(Boolean).length}) 🚀
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  container: {
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "30px 20px 60px 20px",
    fontFamily: "'Inter', sans-serif",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "26px",
  },
  pageTitle: {
    fontSize: "1.85rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    fontFamily: "'Sora', sans-serif",
  },
  pageSub: {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: "6px 0 0 0",
  },
  actionsRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  scanBtn: {
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
  },
  addBtn: {
    background: "#1a2ea8",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(26,46,168,0.25)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },
  statCard: {
    borderRadius: "16px",
    padding: "20px",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  statEmoji: {
    fontSize: "2rem",
    background: "rgba(255,255,255,0.15)",
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
  },
  statLabel: {
    fontSize: "0.82rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    opacity: 0.85,
    margin: 0,
    fontWeight: "600",
  },
  statVal: {
    fontSize: "1.6rem",
    fontWeight: "800",
    margin: "4px 0",
    fontFamily: "'Sora', sans-serif",
  },
  statHint: {
    fontSize: "0.78rem",
    opacity: 0.8,
  },
  filterBar: {
    display: "flex",
    gap: "8px",
    marginBottom: "22px",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  filterTab: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#475569",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  filterTabActive: {
    background: "#1a2ea8",
    color: "white",
    borderColor: "#1a2ea8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconBadge: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  subName: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#0f172a",
  },
  subCat: {
    fontSize: "0.78rem",
    color: "#64748b",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  priceBlock: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: "10px 0",
    borderTop: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9",
  },
  priceAmount: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#0f172a",
    fontFamily: "'Sora', sans-serif",
  },
  priceCycle: {
    fontSize: "0.78rem",
    color: "#64748b",
    textTransform: "capitalize",
  },
  monthlyEquiv: {
    fontSize: "0.82rem",
    color: "#6366f1",
    fontWeight: "600",
  },
  dueBox: {
    border: "1px solid",
    borderRadius: "10px",
    padding: "10px 12px",
  },
  cardMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    color: "#64748b",
  },
  autoTag: {
    color: "#7c3aed",
    fontWeight: "600",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
  },
  renewBtn: {
    flex: 1,
    background: "#dcfce7",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "0.82rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  pauseBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "0.82rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "8px 10px",
    fontSize: "0.82rem",
    cursor: "pointer",
  },
  emptyBox: {
    background: "white",
    borderRadius: "16px",
    padding: "50px 20px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modalContent: {
    background: "white",
    borderRadius: "20px",
    padding: "26px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#0f172a",
    fontFamily: "'Sora', sans-serif",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "1.2rem",
    color: "#64748b",
    cursor: "pointer",
  },
  presetWrap: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  presetPill: {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "4px 10px",
    fontSize: "0.78rem",
    color: "#334155",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
    outline: "none",
    color: "#0f172a",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
    outline: "none",
    color: "#0f172a",
    background: "white",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
  cancelBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#475569",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#1a2ea8",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default Subscriptions;
