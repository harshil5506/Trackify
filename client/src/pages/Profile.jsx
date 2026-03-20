import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    currency: "INR",
    language: "English",
    timezone: "IST (UTC+5:30)",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/api/user/profile");
      setForm((prev) => ({ ...prev, ...data }));
    } catch (err) {}
  };

  const handleSave = async () => {
    try {
      await API.put("/api/user/profile", form);
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div style={s.appBody}>
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "36px 24px 60px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e4e8f0",
            padding: "28px 30px",
            display: "flex",
            alignItems: "flex-start",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#1a2ea8",
                color: "white",
                fontFamily: "'Sora',sans-serif",
                fontSize: "1.5rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {initials}
            </div>
            <button
              style={{
                background: "#f7f8fc",
                border: "1px solid #e4e8f0",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "0.78rem",
                color: "#666",
                cursor: "pointer",
              }}
            >
              Change Photo
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1.4rem",
                fontWeight: "700",
                color: "#1a1a2e",
                marginBottom: "4px",
              }}
            >
              {user?.name}
            </h2>
            <p
              style={{ fontSize: "0.9rem", color: "#666", marginBottom: "2px" }}
            >
              {user?.email}
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "14px",
              }}
            >
              {form.phone || "No phone added"}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => (editing ? handleSave() : setEditing(true))}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  background: "#1a2ea8",
                  color: "white",
                  border: "none",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  fontFamily: "'Sora',sans-serif",
                  cursor: "pointer",
                }}
              >
                {editing ? "Save Changes" : "Edit Profile"}
              </button>
              {editing && (
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    background: "#f7f8fc",
                    color: "#1a1a2e",
                    border: "1px solid #e4e8f0",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div style={s.pcard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#1a1a2e",
                }}
              >
                Personal Information
              </span>
              <button
                onClick={() => setEditing(!editing)}
                style={{
                  background: "#f7f8fc",
                  border: "1px solid #e4e8f0",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✏️
              </button>
            </div>
            {editing ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  { l: "Full Name", k: "name" },
                  { l: "Phone", k: "phone" },
                  { l: "Address", k: "address" },
                  { l: "City", k: "city" },
                  { l: "State", k: "state" },
                  { l: "ZIP", k: "zip" },
                  { l: "Country", k: "country" },
                ].map((f) => (
                  <div
                    key={f.k}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#666" }}>
                      {f.l}
                    </span>
                    <input
                      value={form[f.k] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [f.k]: e.target.value })
                      }
                      style={{
                        padding: "8px 12px",
                        border: "1.5px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {[
                  { l: "Full Name", v: form.name },
                  { l: "Email", v: user?.email },
                  { l: "Phone", v: form.phone || "—" },
                  { l: "Address", v: form.address || "—" },
                  { l: "City", v: form.city || "—" },
                  { l: "Country", v: form.country || "—" },
                ].map((f) => (
                  <div key={f.l} style={{ marginBottom: "14px" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#666",
                        display: "block",
                        marginBottom: "3px",
                      }}
                    >
                      {f.l}
                    </span>
                    <span
                      style={{
                        fontSize: "0.92rem",
                        color: "#1a1a2e",
                        fontWeight: "500",
                      }}
                    >
                      {f.v}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
          <div style={s.pcard}>
            <span
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1rem",
                fontWeight: "700",
                color: "#1a1a2e",
                display: "block",
                marginBottom: "20px",
              }}
            >
              Security Settings
            </span>
            {[
              {
                l: "Two-Factor Auth",
                d: "Extra layer of security",
                v: twoFA,
                s: setTwoFA,
              },
              {
                l: "Email Notifications",
                d: "Transaction alerts via email",
                v: emailNotif,
                s: setEmailNotif,
              },
            ].map((item) => (
              <div
                key={item.l}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom: "1px solid #e4e8f0",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                      marginBottom: "2px",
                    }}
                  >
                    {item.l}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#666" }}>{item.d}</p>
                </div>
                <div
                  onClick={() => item.s(!item.v)}
                  style={{
                    position: "relative",
                    width: "40px",
                    height: "22px",
                    borderRadius: "22px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    background: item.v ? "#2d47c9" : "#e2e6f0",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "16px",
                      height: "16px",
                      background: "white",
                      borderRadius: "50%",
                      top: "3px",
                      left: "3px",
                      transition: "transform 0.2s",
                      transform: item.v ? "translateX(18px)" : "translateX(0)",
                    }}
                  />
                </div>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid #e4e8f0",
              }}
            >
              <span
                style={{
                  fontSize: "1rem",
                  color: "#1a1a2e",
                  letterSpacing: "2px",
                }}
              >
                ••••••••••••
              </span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#2d47c9",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Change
              </button>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                marginTop: "14px",
                padding: "11px",
                borderRadius: "8px",
                border: "1px solid #fca5a5",
                background: "#fff5f5",
                color: "#dc2626",
                fontSize: "0.88rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Sign Out All Devices
            </button>
          </div>
          <div style={s.pcard}>
            <span
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1rem",
                fontWeight: "700",
                color: "#1a1a2e",
                display: "block",
                marginBottom: "20px",
              }}
            >
              Financial Preferences
            </span>
            {[
              { l: "Default Currency", k: "currency" },
              { l: "Language", k: "language" },
              { l: "Timezone", k: "timezone" },
            ].map((f) => (
              <div key={f.k} style={{ marginBottom: "14px" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    display: "block",
                    marginBottom: "3px",
                  }}
                >
                  {f.l}
                </span>
                {editing ? (
                  <input
                    value={form[f.k] || ""}
                    onChange={(e) =>
                      setForm({ ...form, [f.k]: e.target.value })
                    }
                    style={{
                      padding: "8px 12px",
                      border: "1.5px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      outline: "none",
                      width: "100%",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "0.92rem",
                      color: "#1a1a2e",
                      fontWeight: "500",
                    }}
                  >
                    {form[f.k]}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={s.pcard}>
            <span
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1rem",
                fontWeight: "700",
                color: "#1a1a2e",
                display: "block",
                marginBottom: "20px",
              }}
            >
              Activity Summary
            </span>
            {[
              {
                l: "Account Created",
                v: new Date(user?.createdAt || Date.now()).toLocaleDateString(),
              },
              { l: "Last Login", v: "Today, 2:45 PM" },
              { l: "Categories Used", v: "12" },
              { l: "Total Transactions", v: "—" },
            ].map((item) => (
              <div
                key={item.l}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f7f8fc",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                      marginBottom: "2px",
                    }}
                  >
                    {item.l}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    color: "#2d47c9",
                  }}
                >
                  {item.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  pcard: {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e4e8f0",
    padding: "24px",
  },
};

export default Profile;
