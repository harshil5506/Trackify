import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const About = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "white",
        minHeight: "100vh",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      <section
        style={{
          padding: "50px 40px 40px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          <h1
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "2.6rem",
              fontWeight: "800",
              color: "#1a1a2e",
              lineHeight: 1.15,
            }}
          >
            About
            <br />
            Trackify
          </h1>
          <div>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1a2ea8",
                lineHeight: 1.6,
                marginBottom: "14px",
              }}
            >
              Trackify is a simple and secure personal expense tracker that
              helps you manage money smarter.
            </p>
            <p
              style={{
                fontSize: "0.93rem",
                color: "#666",
                lineHeight: 1.7,
                marginBottom: "20px",
              }}
            >
              Managing personal finances can be confusing and time consuming.
              Trackify is built to make expense tracking simple, transparent and
              accessible to everyone.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                "✅ Secure and user focused",
                "✅ No hidden fees, always free",
              ].map((b) => (
                <span
                  key={b}
                  style={{
                    fontSize: "0.83rem",
                    fontWeight: "500",
                    color: "#1a1a2e",
                    background: "#f0f3ff",
                    border: "1px solid #e4e8f0",
                    borderRadius: "20px",
                    padding: "6px 14px",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section style={{ padding: "44px 0", borderTop: "1px solid #e4e8f0" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1.5rem",
              fontWeight: "800",
              color: "#1a1a2e",
              marginBottom: "24px",
            }}
          >
            Key Features
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {[
              {
                icon: "📈",
                title: "Track Income & Expenses",
                desc: "Easily log your daily transactions.",
              },
              {
                icon: "⚙️",
                title: "Categorize Spending",
                desc: "Automatically sort expenses by category.",
              },
              {
                icon: "💰",
                title: "Set Monthly Budget",
                desc: "Set budget to stay on track.",
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  background: "white",
                  border: "1px solid #e4e8f0",
                  borderRadius: "12px",
                  padding: "18px 22px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    minWidth: "44px",
                    background: "linear-gradient(135deg,#2d47c9,#1a2ea8)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontSize: "0.98rem",
                      fontWeight: "700",
                      color: "#1a1a2e",
                      marginBottom: "3px",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        style={{
          padding: "44px 0",
          borderTop: "1px solid #e4e8f0",
          background: "#f7f8fc",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1.5rem",
              fontWeight: "800",
              color: "#1a1a2e",
              marginBottom: "24px",
            }}
          >
            Our Values
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "16px",
            }}
          >
            {[
              {
                icon: "🔒",
                title: "Privacy First",
                desc: "Your data stays secure",
              },
              {
                icon: "✅",
                title: "Simplicity",
                desc: "Easy to use, no clutter",
              },
              {
                icon: "📊",
                title: "Clarity",
                desc: "Clear insights, better decisions",
              },
            ].map((v) => (
              <div
                key={v.title}
                style={{
                  background: "white",
                  border: "1px solid #e4e8f0",
                  borderRadius: "14px",
                  padding: "24px 20px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    background: "linear-gradient(135deg,#2d47c9,#1a2ea8)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "14px",
                    fontSize: "20px",
                  }}
                >
                  {v.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: "6px",
                  }}
                >
                  {v.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#666" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ background: "#1a2ea8", padding: "50px 0" }}>
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "0 40px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "50px",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1.15rem",
                fontWeight: "700",
                color: "white",
                marginBottom: "16px",
              }}
            >
              Why Choose Trackify?
            </h3>
            <p
              style={{
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.75,
              }}
            >
              We believe financial wellness should be accessible to everyone.
              Trackify removes complexity from expense tracking.
            </p>
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1.15rem",
                fontWeight: "700",
                color: "white",
                marginBottom: "16px",
              }}
            >
              Our Commitment
            </h3>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {[
                "Your data is encrypted and never shared",
                "Regular updates based on user feedback",
                "Dedicated support team ready to assist",
                "100% free, no hidden costs",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "0.88rem",
                    color: "rgba(255,255,255,0.78)",
                  }}
                >
                  <span style={{ color: "#7dd3fc" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          fontSize: "14px",
          color: "#666",
          borderTop: "1px solid #e4e8f0",
        }}
      >
        © 2024 Trackify. All rights reserved.
      </footer>
    </div>
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
};

export default About;
