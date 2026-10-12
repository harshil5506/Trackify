import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import logo from "../assets/logo_final.jpeg";
import CurrencySwitcher from "./CurrencySwitcher";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState(null); // 'expenses', 'planning', 'social', 'analytics', 'user'
  const navRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (paths) => paths.some((p) => location.pathname.startsWith(p));

  const navGroups = [
    {
      id: "dashboard",
      type: "link",
      to: "/dashboard",
      label: "Dashboard",
    },
    {
      id: "expenses",
      type: "dropdown",
      label: "Finances",
      matchPaths: ["/add-expense", "/transactions", "/income"],
      items: [
        {
          to: "/add-expense",
          label: "Add Expense",
          desc: "Quick text, receipt scanner & voice entry",
          icon: "➕",
        },
        {
          to: "/transactions",
          label: "Transaction History",
          desc: "Complete history, filters & CSV export",
          icon: "💳",
        },
        {
          to: "/income",
          label: "Income",
          desc: "Earnings, salary & revenue sources",
          icon: "💰",
        },
      ],
    },
    {
      id: "planning",
      type: "dropdown",
      label: "Planning",
      matchPaths: ["/investments", "/goals", "/budget", "/subscriptions"],
      items: [
        {
          to: "/investments",
          label: "Investments",
          desc: "Asset tracking, portfolio valuation & allocation",
          icon: "📈",
        },
        {
          to: "/goals",
          label: "Savings Goals",
          desc: "Target deadlines & dynamic pace tracker",
          icon: "🎯",
        },
        {
          to: "/budget",
          label: "Budget",
          desc: "Category spending caps & alert thresholds",
          icon: "📊",
        },
        {
          to: "/subscriptions",
          label: "Subscriptions",
          desc: "Recurring fixed burn & smart expense detector",
          icon: "🔁",
        },
      ],
    },
    {
      id: "social",
      type: "dropdown",
      label: "Social & Split",
      matchPaths: ["/groups", "/friends", "/activity"],
      items: [
        {
          to: "/groups",
          label: "Groups",
          desc: "Split group expenses with debt simplifier",
          icon: "👥",
        },
        {
          to: "/friends",
          label: "Friends",
          desc: "Track 1-on-1 balances & settlement notes",
          icon: "🤝",
        },
        {
          to: "/activity",
          label: "Activity",
          desc: "Recent transactions across friends & groups",
          icon: "⚡",
        },
      ],
    },
    {
      id: "analytics",
      type: "dropdown",
      label: "Insights",
      matchPaths: ["/reports", "/quiz"],
      items: [
        {
          to: "/reports",
          label: "Reports",
          desc: "ML spending prediction, trends & mood analysis",
          icon: "📑",
        },
        {
          to: "/quiz",
          label: "Personality Quiz",
          desc: "Financial psychology test & spending archetype",
          icon: "🧠",
        },
      ],
    },
  ];

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  return (
    <nav style={s.appNav} ref={navRef}>
      {/* Brand: Logo + App Name */}
      <div style={s.appNavBrand}>
        <Link to="/dashboard" style={s.brandLink}>
          <img src={logo} alt="Trackify" style={s.logoImg} />
          <span style={s.brandText}>Trackify</span>
        </Link>
      </div>

      {/* Main Grouped Navigation Links */}
      <ul style={s.appNavLinks}>
        {navGroups.map((group) => {
          if (group.type === "link") {
            const active = isActive(group.to);
            return (
              <li key={group.id} style={s.navItem}>
                <Link
                  to={group.to}
                  style={{
                    ...s.navLink,
                    color: active ? "white" : "rgba(255,255,255,0.8)",
                    fontWeight: active ? "700" : "500",
                    borderBottom: active ? "2.5px solid white" : "2.5px solid transparent",
                  }}
                >
                  {group.label}
                </Link>
              </li>
            );
          }

          const active = isGroupActive(group.matchPaths);
          const isOpen = openDropdown === group.id;

          return (
            <li key={group.id} style={s.navItem}>
              <button
                type="button"
                onClick={() => toggleDropdown(group.id)}
                style={{
                  ...s.dropdownToggle,
                  color: active || isOpen ? "white" : "rgba(255,255,255,0.8)",
                  fontWeight: active || isOpen ? "700" : "500",
                  borderBottom: active ? "2.5px solid white" : "2.5px solid transparent",
                }}
              >
                <span>{group.label}</span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    transition: "transform 0.2s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Group Dropdown Menu */}
              {isOpen && (
                <div style={s.dropdownMenu}>
                  {group.items.map((item) => {
                    const itemActive = isActive(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        style={{
                          ...s.dropdownItem,
                          background: itemActive ? "#eff6ff" : "transparent",
                          borderLeft: itemActive ? "3px solid #1a2ea8" : "3px solid transparent",
                        }}
                      >
                        <span style={s.itemIcon}>{item.icon}</span>
                        <div>
                          <strong style={{ ...s.itemTitle, color: itemActive ? "#1a2ea8" : "#0f172a" }}>
                            {item.label}
                          </strong>
                          <p style={s.itemDesc}>{item.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Right Side: Currency Switcher + Notifications + User Avatar Menu */}
      <div style={s.appNavRight}>
        <CurrencySwitcher />

        {/* Notifications */}
        <button style={s.notifBtn} title="Notifications">
          🔔<span style={s.notifBadge}>2</span>
        </button>

        {/* User Profile Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => toggleDropdown("user")}
            style={s.userPill}
          >
            <div style={s.avatarCircle}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span style={s.userName}>{user?.name?.split(" ")[0] || "User"}</span>
            <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>▼</span>
          </button>

          {openDropdown === "user" && (
            <div style={{ ...s.dropdownMenu, right: 0, width: "220px" }}>
              <div style={s.userHeader}>
                <strong style={{ fontSize: "0.9rem", color: "#0f172a", display: "block" }}>
                  {user?.name}
                </strong>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {user?.email}
                </span>
              </div>

              <Link to="/profile" style={s.userMenuItem}>
                <span>👤</span>
                <span>Profile & Heatmap</span>
              </Link>
              <Link to="/set-pin" style={s.userMenuItem}>
                <span>🔒</span>
                <span>Security PIN Lock</span>
              </Link>

              <div style={s.menuDivider} />

              <button onClick={handleLogout} style={s.logoutMenuItem}>
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const s = {
  appNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    height: "64px",
    background: "#1a2ea8",
    position: "sticky",
    top: 0,
    zIndex: 999,
    boxShadow: "0 4px 16px rgba(26,46,168,0.2)",
    fontFamily: "'Inter', sans-serif",
  },
  appNavBrand: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  brandLink: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoImg: {
    height: "38px",
    width: "38px",
    objectFit: "contain",
    borderRadius: "8px",
    background: "white",
    padding: "3px",
  },
  brandText: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "19px",
    fontWeight: "700",
    color: "white",
    letterSpacing: "0.02em",
  },
  appNavLinks: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  navItem: {
    position: "relative",
  },
  navLink: {
    display: "inline-block",
    fontSize: "0.88rem",
    textDecoration: "none",
    padding: "6px 8px",
    transition: "color 0.15s ease",
    whiteSpace: "nowrap",
  },
  dropdownToggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "none",
    fontSize: "0.88rem",
    cursor: "pointer",
    padding: "6px 8px",
    transition: "color 0.15s ease",
    whiteSpace: "nowrap",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: "50%",
    transform: "translateX(-50%)",
    width: "290px",
    background: "white",
    borderRadius: "14px",
    boxShadow: "0 14px 35px rgba(0,0,0,0.18)",
    border: "1px solid #e2e8f0",
    padding: "6px 0",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    animation: "fadeIn 0.15s ease",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "10px 14px",
    textDecoration: "none",
    transition: "background 0.15s ease",
  },
  itemIcon: {
    fontSize: "1.2rem",
    marginTop: "1px",
    flexShrink: 0,
  },
  itemTitle: {
    display: "block",
    fontSize: "0.88rem",
    fontWeight: "700",
  },
  itemDesc: {
    margin: "2px 0 0 0",
    fontSize: "0.74rem",
    color: "#64748b",
    lineHeight: "1.3",
  },
  appNavRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },
  notifBtn: {
    position: "relative",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "white",
    fontSize: "15px",
  },
  notifBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    background: "#ef4444",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #1a2ea8",
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "20px",
    padding: "4px 10px 4px 4px",
    cursor: "pointer",
    color: "white",
  },
  avatarCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "white",
    color: "#1a2ea8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "13px",
  },
  userName: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "white",
    fontFamily: "'Sora', sans-serif",
  },
  userHeader: {
    padding: "10px 14px 8px 14px",
    borderBottom: "1px solid #f1f5f9",
  },
  userMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 14px",
    color: "#1e293b",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "background 0.15s ease",
  },
  menuDivider: {
    height: "1px",
    background: "#f1f5f9",
    margin: "4px 0",
  },
  logoutMenuItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 14px",
    color: "#dc2626",
    background: "transparent",
    border: "none",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
  },
};

export default Navbar;
