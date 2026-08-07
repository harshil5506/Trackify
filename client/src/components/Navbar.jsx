import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import logo from "../assets/logo_final.jpeg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/add-expense", label: "Add Expense" },
    { to: "/transactions", label: "Transactions" },
    { to: "/reports", label: "Reports" },
    { to: "/budget", label: "Budget" },
    { to: "/friends", label: "Friends" },
    { to: "/groups", label: "Groups" },
    { to: "/profile", label: "Profile & Heatmap" },
  ];

  return (
    <nav style={s.appNav}>
      {/* Brand — Logo + Text */}
      <div style={s.appNavBrand}>
        <Link
          to="/dashboard"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img
            src={logo}
            alt="Trackify"
            style={{
              height: "42px",
              width: "42px",
              objectFit: "contain",
              borderRadius: "8px",
              background: "white",
              padding: "3px",
            }}
          />
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "19px",
              fontWeight: "700",
              color: "white",
              letterSpacing: "0.02em",
            }}
          >
            Trackify
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <ul style={s.appNavLinks}>
        {navLinks.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              style={{
                ...s.appNavLink,
                color: isActive(link.to) ? "white" : "rgba(255,255,255,0.78)",
                fontWeight: isActive(link.to) ? "700" : "500",
                borderBottom: isActive(link.to)
                  ? "2px solid white"
                  : "2px solid transparent",
                paddingBottom: "4px",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right Side */}
      <div style={s.appNavRight}>
        <button style={s.notifBtn}>
          🔔<span style={s.notifBadge}>2</span>
        </button>
        <Link to="/profile" style={{ textDecoration: "none" }}>
          <div style={s.appUserChip}>
            <div style={s.appAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={s.appUsername}>{user?.name}</span>
          </div>
        </Link>
        <button style={s.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const s = {
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
    boxShadow: "0 2px 12px rgba(26,46,168,0.15)",
  },
  appNavBrand: {
    display: "flex",
    alignItems: "center",
  },
  appNavLinks: {
    display: "flex",
    gap: "30px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  appNavLink: {
    fontSize: "14px",
    textDecoration: "none",
    transition: "color 0.2s",
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
    cursor: "pointer",
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
};

export default Navbar;
