import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const friendRequests = [
  { initials: "AT", name: "Alex Thompson", mutual: 5, time: "2 hours ago" },
  { initials: "JL", name: "Jessica Lee", mutual: 12, time: "5 hours ago" },
  { initials: "RC", name: "Ryan Cooper", mutual: 8, time: "1 day ago" },
];

const recentFriends = [
  { initials: "SJ", name: "Sarah Johnson", mutual: 23, online: true },
  { initials: "MC", name: "Michael Chen", mutual: 15, online: false },
  { initials: "EW", name: "Emma Williams", mutual: 31, online: false },
  { initials: "JR", name: "James Rodriguez", mutual: 8, online: false },
  { initials: "OM", name: "Olivia Martinez", mutual: 19, online: true },
];

const Friends = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(friendRequests);

  const handleAccept = (name) => {
    setRequests((p) => p.filter((r) => r.name !== name));
    toast.success(`${name} accepted!`);
  };
  const handleDecline = (name) => {
    setRequests((p) => p.filter((r) => r.name !== name));
    toast.error(`${name} declined`);
  };
  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <div style={s.appBody}>
      <nav style={s.appNav}>
        <div style={s.appNavBrand}>
          <div style={s.appLogoFallback}>T</div>
          <span style={s.appBrandName}>Trackify</span>
        </div>
        <ul style={s.appNavLinks}>
          <li>
            <Link to="/dashboard" style={s.appNavLink}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/add-expense" style={s.appNavLink}>
              Add Expense
            </Link>
          </li>
          <li>
            <Link to="/transactions" style={s.appNavLink}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/friends" style={{ ...s.appNavLink, color: "white" }}>
              Friends
            </Link>
          </li>
          <li>
            <Link to="/budget" style={s.appNavLink}>
              Budget
            </Link>
          </li>
        </ul>
        <div style={s.appNavRight}>
          <button style={s.notifBtn}>
            🔔<span style={s.notifBadge}>2</span>
          </button>
          <div style={s.appUserChip}>
            <div style={s.appAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={s.appUsername}>{user?.name}</span>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main style={s.dashMain}>
        <div>
          <h1 style={s.pageTitle}>Friends & Social</h1>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>
            Manage your connections
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "14px",
          }}
        >
          {[
            {
              icon: "👥",
              label: "Total Friends",
              value: "247",
              tag: "+12 this week",
              tagBg: "#dbeafe",
              tagColor: "#1d4ed8",
            },
            {
              icon: "⏰",
              label: "Pending Requests",
              value: requests.length.toString(),
              tag: "Action needed",
              tagBg: "#fef3c7",
              tagColor: "#92400e",
            },
            {
              icon: "⚙️",
              label: "Groups Joined",
              value: "8",
              tag: "Active",
              tagBg: "#dcfce7",
              tagColor: "#166534",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "linear-gradient(160deg,#1e36be,#2a47d0)",
                borderRadius: "14px",
                padding: "18px 20px",
                color: "white",
                minHeight: "110px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "18px" }}>{stat.icon}</span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: "600",
                    padding: "2px 8px",
                    borderRadius: "5px",
                    background: stat.tagBg,
                    color: stat.tagColor,
                  }}
                >
                  {stat.tag}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.72)",
                  marginBottom: "3px",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "2rem",
                  fontWeight: "800",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
          <div
            style={{
              background: "linear-gradient(160deg,#1e36be,#2a47d0)",
              borderRadius: "14px",
              padding: "18px 20px",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                marginBottom: "8px",
              }}
            >
              ➕
            </div>
            <p
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "0.9rem",
                fontWeight: "700",
              }}
            >
              Invite Friends
            </p>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.68)" }}>
              Grow your network
            </p>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div style={s.dashCard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={s.dashCardTitle}>Friend Requests</h3>
              <span
                style={{
                  background: "#1a2ea8",
                  color: "white",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                  padding: "3px 10px",
                  borderRadius: "20px",
                }}
              >
                {requests.length} pending
              </span>
            </div>
            {requests.length === 0 ? (
              <p
                style={{
                  color: "#666",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No pending requests
              </p>
            ) : (
              requests.map((req) => (
                <div
                  key={req.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "13px 0",
                    borderBottom: "1px solid #f0f2f8",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#e2e6f5",
                      color: "#1a2ea8",
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {req.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: "600",
                        color: "#1a1a2e",
                        marginBottom: "2px",
                      }}
                    >
                      {req.name}
                    </p>
                    <p style={{ fontSize: "0.73rem", color: "#666" }}>
                      👥 {req.mutual} mutual • {req.time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAccept(req.name)}
                    style={{
                      background: "#1a2ea8",
                      color: "white",
                      border: "none",
                      borderRadius: "7px",
                      padding: "6px 16px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(req.name)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    Decline
                  </button>
                </div>
              ))
            )}
          </div>
          <div style={s.dashCard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={s.dashCardTitle}>Recent Friends</h3>
              <a
                href="#"
                style={{
                  fontSize: "0.82rem",
                  color: "#2d47c9",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                View All
              </a>
            </div>
            {recentFriends.map((f) => (
              <div
                key={f.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "13px 0",
                  borderBottom: "1px solid #f0f2f8",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#e2e6f5",
                      color: "#1a2ea8",
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {f.initials}
                  </div>
                  {f.online && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "1px",
                        right: "1px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#22c55e",
                        border: "2px solid white",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                      marginBottom: "2px",
                    }}
                  >
                    {f.name}
                  </p>
                  <p style={{ fontSize: "0.73rem", color: "#666" }}>
                    {f.mutual} mutual friends
                  </p>
                </div>
                <button
                  style={{
                    background: "#f3f4f8",
                    border: "1px solid #e2e6f0",
                    borderRadius: "7px",
                    padding: "5px 16px",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    color: "#1a1a2e",
                    cursor: "pointer",
                  }}
                >
                  Message
                </button>
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
  dashCard: {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e2e6f0",
    padding: "26px 28px",
  },
  dashCardTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a2e",
  },
};

export default Friends;
