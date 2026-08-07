import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Verify = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    const interval = setInterval(
      () => setTimer((t) => (t > 0 ? t - 1 : 0)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    if (val && idx < 5) document.getElementById(`code-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0)
      document.getElementById(`code-${idx - 1}`)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.join("").length < 6)
      return toast.error("Enter complete 6-digit code");
    setLoading(true);
    setTimeout(() => {
      toast.success("Email verified!");
      navigate("/login");
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>T</div>
          <span style={s.logoText}>Trackify</span>
        </div>
        <div style={{ fontSize: "52px", marginBottom: "16px" }}>✉️</div>
        <h1 style={s.title}>Verify Your Email</h1>
        <p style={s.sub}>
          We've sent a 6-digit verification code to your email. Enter it below.
        </p>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`code-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                style={{
                  width: "50px",
                  height: "56px",
                  border: `1.5px solid ${digit ? "#1a2ea8" : "#e4e8f0"}`,
                  borderRadius: "12px",
                  fontSize: "22px",
                  fontWeight: "700",
                  fontFamily: "'Sora',sans-serif",
                  color: "#1a2ea8",
                  textAlign: "center",
                  outline: "none",
                  background: digit ? "#f0f3ff" : "#fafbff",
                }}
              />
            ))}
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
        <div style={s.divider} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "#666" }}>
            Didn't receive the code?
          </p>
          {timer > 0 ? (
            <p style={{ fontSize: "14px", color: "#666" }}>
              Resend in{" "}
              <strong style={{ color: "#1a2ea8" }}>
                00:{timer.toString().padStart(2, "0")}
              </strong>
            </p>
          ) : (
            <button
              onClick={() => {
                toast.success("Code resent!");
                setTimer(59);
                setCode(["", "", "", "", "", ""]);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#1a2ea8",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Resend Code
            </button>
          )}
        </div>
        <div style={s.divider} />
        <p style={{ fontSize: "14px", color: "#666" }}>
          Wrong email?{" "}
          <Link to="/signup" style={s.link}>
            Go back and change it
          </Link>
        </p>
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
  },
  divider: { borderTop: "1px solid #e4e8f0", margin: "24px 0" },
  link: { color: "#1a2ea8", fontWeight: "600", textDecoration: "none" },
};

export default Verify;
