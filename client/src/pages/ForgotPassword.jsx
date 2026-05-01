import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import API from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  try {
    await API.post("/api/auth/forgot-password", { email });

    setSent(true);
    toast.success("Reset link sent!");
  } catch (err) {
    toast.error(err.response?.data?.message || "Error sending email");
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>T</div>
          <span style={s.logoText}>Trackify</span>
        </div>
        {!sent ? (
          <>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              🔒
            </div>
            <h1 style={s.title}>Forgot Password?</h1>
            <p style={s.sub}>
              No worries! Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={s.input}
                />
              </div>
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <div style={s.divider} />
            <p style={s.bottom}>
              Remember your password?{" "}
              <Link to="/login" style={s.link}>
                Back to Login
              </Link>
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "56px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              📧
            </div>
            <h1 style={s.title}>Check your Email</h1>
            <p style={s.sub}>
              We've sent a reset link to <strong>{email}</strong>. Check your
              inbox.
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                background: "#f0f3ff",
                border: "1px solid #c7d2fe",
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "20px",
              }}
            >
              <span>ℹ️</span>
              <p
                style={{ fontSize: "13px", color: "#1a2ea8", lineHeight: 1.5 }}
              >
                Didn't receive it? Check spam or try again.
              </p>
            </div>
            <button
              style={s.btn}
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Try Different Email
            </button>
            <div style={s.divider} />
            <p style={s.bottom}>
              <Link to="/login" style={s.link}>
                ← Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const s = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#1a2ea8 0%,#2d47c9 60%,#4a6cf7 100%)",
    padding: "20px",
    fontFamily: "'Inter',sans-serif",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "44px 40px",
    width: "100%",
    maxWidth: "440px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "28px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#1a2ea8",
    color: "white",
    fontFamily: "'Sora',sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  title: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "24px",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "12px",
  },
  sub: {
    fontSize: "14px",
    color: "#666",
    lineHeight: 1.7,
    marginBottom: "28px",
    maxWidth: "340px",
    margin: "0 auto 28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    textAlign: "left",
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#1a1a2e" },
  input: {
    padding: "12px 14px",
    border: "1.5px solid #e4e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "'Inter',sans-serif",
    color: "#1a1a2e",
    background: "#fafbff",
    outline: "none",
  },
  btn: {
    width: "100%",
    padding: "13px",
    background: "#1a2ea8",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "'Sora',sans-serif",
    cursor: "pointer",
    marginTop: "4px",
  },
  divider: { borderTop: "1px solid #e4e8f0", margin: "24px 0" },
  bottom: { fontSize: "14px", color: "#666" },
  link: { color: "#1a2ea8", fontWeight: "600", textDecoration: "none" },
};

export default ForgotPassword;
