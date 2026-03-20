import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Groups = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    memberEmails: "",
  });

  // ✅ Fetch groups from backend on load
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await API.get("/api/groups");
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Actually create group via API
  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Group name is required");
    setCreating(true);
    try {
      const memberEmails = form.memberEmails
        ? form.memberEmails
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean)
        : [];

      await API.post("/api/groups", {
        name: form.name,
        description: form.description,
        memberEmails,
      });

      toast.success("Group created!");
      setShowForm(false);
      setForm({ name: "", description: "", memberEmails: "" });
      fetchGroups(); // ← refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      await API.delete(`/api/groups/${id}`);
      toast.success("Group deleted!");
      fetchGroups();
    } catch (err) {
      toast.error("Failed to delete group");
    }
  };

  return (
    <div style={s.appBody}>
      <main style={s.dashMain}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={s.pageTitle}>Groups</h1>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
              Split expenses with your groups
            </p>
          </div>
          <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Create Group"}
          </button>
        </div>

        {/* Create Group Form */}
        {showForm && (
          <div style={s.dashCard}>
            <h3 style={s.cardTitle}>Create New Group</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                type="text"
                placeholder="Group name e.g. Trip to Goa"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={s.formInput}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                style={s.formInput}
              />
              <input
                type="text"
                placeholder="Member emails, comma separated (optional)"
                value={form.memberEmails}
                onChange={(e) =>
                  setForm({ ...form, memberEmails: e.target.value })
                }
                style={s.formInput}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  style={s.addBtn}
                >
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Groups List */}
        <div style={s.dashCard}>
          <h3 style={s.cardTitle}>
            Your Groups{" "}
            <span style={{ color: "#666", fontWeight: "400" }}>
              ({groups.length})
            </span>
          </h3>

          {loading ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              Loading...
            </p>
          ) : groups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: "56px", marginBottom: "16px" }}>🤝</p>
              <h3
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: "8px",
                }}
              >
                No groups yet
              </h3>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "#666",
                  marginBottom: "24px",
                }}
              >
                Create a group to split expenses with friends and family
              </p>
              <button onClick={() => setShowForm(true)} style={s.addBtn}>
                Create Your First Group
              </button>
            </div>
          ) : (
            // ✅ Display groups as cards
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {groups.map((group) => (
                <div
                  key={group._id}
                  style={s.groupCard}
                  onClick={() => navigate(`/groups/${group._id}`)}
                >
                  <div style={s.groupIcon}>🤝</div>
                  <div style={{ flex: 1 }}>
                    <p style={s.groupName}>{group.name}</p>
                    <p style={s.groupSub}>
                      {group.description || "No description"} •{" "}
                      {group.members?.length || 1} member
                      {group.members?.length !== 1 ? "s" : ""}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      {group.members?.slice(0, 3).map((m) => (
                        <span key={m._id} style={s.memberChip}>
                          {m.name?.charAt(0).toUpperCase()}{" "}
                          {m.name?.split(" ")[0]}
                        </span>
                      ))}
                      {group.members?.length > 3 && (
                        <span style={s.memberChip}>
                          +{group.members.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <span style={s.expenseCount}>
                      {group.expenses?.length || 0} expense
                      {group.expenses?.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      style={s.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click
                        handleDelete(group._id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Quick Actions */}
        <div style={s.dashCard}>
          <h3 style={s.cardTitle}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              {
                icon: "👥",
                name: "Add Members",
                sub: "Invite friends to your group",
                action: () => setShowForm(true),
              },
              {
                icon: "💸",
                name: "Split Expense",
                sub: "Add a shared expense",
                action: () => {
                  if (groups.length === 0) {
                    toast.error("Create a group first!");
                  } else {
                    navigate(`/groups/${groups[0]._id}`);
                  }
                },
              },
              {
                icon: "✅",
                name: "Settle Up",
                sub: "See who owes what",
                action: () => {
                  if (groups.length === 0) {
                    toast.error("Create a group first!");
                  } else {
                    navigate(`/groups/${groups[0]._id}`);
                  }
                },
              },
            ].map((qa) => (
              <div
                key={qa.name}
                onClick={qa.action}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "13px 14px",
                  borderRadius: "10px",
                  background: "#f7f8fc",
                  cursor: "pointer",
                  border: "1px solid #e2e6f0",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "white",
                    border: "1px solid #e2e6f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  {qa.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.86rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                      marginBottom: "2px",
                    }}
                  >
                    {qa.name}
                  </p>
                  <p style={{ fontSize: "0.73rem", color: "#666" }}>{qa.sub}</p>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    color: "#999",
                    fontSize: "16px",
                  }}
                >
                  →
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
  dashMain: {
    maxWidth: "1060px",
    margin: "0 auto",
    padding: "28px 28px 60px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  pageTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1.9rem",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  addBtn: {
    background: "#1a2ea8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "0.88rem",
    fontWeight: "600",
    fontFamily: "'Sora',sans-serif",
    cursor: "pointer",
  },
  dashCard: {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e2e6f0",
    padding: "26px 28px",
  },
  cardTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "16px",
  },
  formInput: {
    padding: "11px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontFamily: "'Inter',sans-serif",
    color: "#1a1a2e",
    background: "#f9fafb",
    outline: "none",
  },
  groupCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    borderRadius: "12px",
    background: "#f8f9fc",
    border: "1px solid #e2e6f0",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
  },
  groupIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#e3ebff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },
  groupName: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "3px",
  },
  groupSub: { fontSize: "0.78rem", color: "#666" },
  memberChip: {
    fontSize: "0.7rem",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "4px",
    background: "#e3ebff",
    color: "#1a2ea8",
  },
  expenseCount: {
    fontSize: "0.75rem",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "6px",
    background: "#f0f2ff",
    color: "#1a2ea8",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Groups;
