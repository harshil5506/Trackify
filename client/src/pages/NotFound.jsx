import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "#eef0f7",
        minHeight: "100vh",
        fontFamily: "'Inter',sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "540px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "80px", marginBottom: "16px" }}>📄</div>
        <h1
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "5rem",
            fontWeight: "800",
            color: "#1a1a2e",
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#1a1a2e",
            marginBottom: "12px",
          }}
        >
          Page Not Found
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#666",
            lineHeight: 1.65,
            maxWidth: "400px",
            margin: "0 auto 26px",
          }}
        >
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "1.5px solid #d1d5db",
              background: "white",
              fontFamily: "'Sora',sans-serif",
              fontSize: "0.88rem",
              fontWeight: "600",
              color: "#1a1a2e",
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
          <Link
            to="/dashboard"
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#1a2ea8",
              fontFamily: "'Sora',sans-serif",
              fontSize: "0.88rem",
              fontWeight: "600",
              color: "white",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Go Home
          </Link>
        </div>
        <div
          style={{
            background: "#f7f8fc",
            borderRadius: "14px",
            border: "1px solid #e2e6f0",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "1rem",
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: "16px",
            }}
          >
            Quick Links
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {[
              { icon: "🏠", name: "Dashboard", to: "/dashboard" },
              { icon: "👤", name: "Profile", to: "/profile" },
              { icon: "ℹ️", name: "About", to: "/about" },
              { icon: "💬", name: "Contact", to: "/contact" },
            ].map((l) => (
              <Link
                key={l.name}
                to={l.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "white",
                  border: "1px solid #e2e6f0",
                  borderRadius: "10px",
                  padding: "13px 14px",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: "20px" }}>{l.icon}</span>
                <span
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}
                >
                  {l.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
