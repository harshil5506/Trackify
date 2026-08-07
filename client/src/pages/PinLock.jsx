import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const PinLock = () => {
  const { user, verifyPin, logout } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState([]);
  const [shake, setShake] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNumber = (num) => {
    if (pin.length >= 4) return;
    const newPin = [...pin, num];
    setPin(newPin);
    if (newPin.length === 4) setTimeout(() => handleVerify(newPin), 300);
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  const handleVerify = async (pinArr) => {
    try {
      await API.post("/api/auth/verify-pin", {
        userId: user.id,
        pin: pinArr.join(""),
      });
      verifyPin();
      navigate("/dashboard");
    } catch (err) {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin([]);
        toast.error("Wrong PIN, try again");
      }, 600);
    }
  };

  const handlePasswordUnlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/api/auth/login", { email: user.email, password });
      verifyPin();
      navigate("/dashboard");
      toast.success("Unlocked!");
    } catch (err) {
      toast.error("Wrong password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>T</div>
          <span style={s.logoText}>Trackify</span>
        </div>

        {/* Avatar */}
        <div style={s.avatar}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <p style={s.userName}>{user?.name || "User"}</p>

        {!usePassword ? (
          <>
            <div style={s.iconCircle}>
              <span style={{ fontSize: "24px" }}>🔒</span>
            </div>
            <h1 style={s.title}>Welcome back!</h1>
            <p style={s.sub}>Enter your PIN to continue.</p>

            {/* PIN Dots */}
            <div style={{ ...s.dotsWrap, animation: shake ? "shake 0.5s" : "none" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  ...s.dot,
                  background: i < pin.length ? "#1a2ea8" : "transparent",
                  border: `2.5px solid ${i < pin.length ? "#1a2ea8" : "#c7d2fe"}`,
                  transform: i < pin.length ? "scale(1.15)" : "scale(1)",
                }} />
              ))}
            </div>

            {/* Number Pad */}
            <div style={s.pad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button key={num} style={s.padBtn} onClick={() => handleNumber(num)}
                  onMouseEnter={e => e.target.style.background = "#f0f3ff"}
                  onMouseLeave={e => e.target.style.background = "#fafbff"}>
                  {num}
                </button>
              ))}
              <div />
              <button style={s.padBtn} onClick={() => handleNumber(0)}
                onMouseEnter={e => e.target.style.background = "#f0f3ff"}
                onMouseLeave={e => e.target.style.background = "#fafbff"}>
                0
              </button>
              <button style={s.deleteBtn} onClick={handleDelete}>⌫</button>
            </div>

            <button style={s.forgotBtn} onClick={() => setUsePassword(true)}>
              Forgot PIN? Use password instead
            </button>
          </>
        ) : (
          <>
            <div style={s.iconCircle}>
              <span style={{ fontSize: "24px" }}>🔑</span>
            </div>
            <h1 style={s.title}>Enter Password</h1>
            <p style={s.sub}>Use your account password to unlock.</p>

            <form onSubmit={handlePasswordUnlock} style={s.form}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={s.input}
              />
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? "Unlocking..." : "Unlock"}
              </button>
            </form>

            <button style={s.forgotBtn} onClick={() => { setUsePassword(false); setPin([]); }}>
              ← Back to PIN
            </button>
          </>
        )}

        <div style={s.divider} />
        <button style={s.logoutBtn} onClick={() => { logout(); navigate("/login"); }}>
          Sign out
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)}
          40%{transform:translateX(10px)}
          60%{transform:translateX(-10px)}
          80%{transform:translateX(10px)}
        }
      `}</style>
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
    borderRadius: "24px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  logoIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#1a2ea8",
    color: "white",
    fontFamily: "'Sora',sans-serif",
    fontSize: "17px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "21px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#1a2ea8",
    color: "white",
    fontSize: "24px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 8px",
    fontFamily: "'Sora',sans-serif",
  },
  userName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "16px",
  },
  iconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "22px",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  sub: {
    fontSize: "13px",
    color: "#888",
    lineHeight: 1.7,
    marginBottom: "24px",
  },
  dotsWrap: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    marginBottom: "28px",
  },
  dot: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    transition: "all 0.2s ease",
  },
  pad: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  padBtn: {
    padding: "18px",
    fontSize: "20px",
    fontWeight: "600",
    fontFamily: "'Sora',sans-serif",
    color: "#1a1a2e",
    background: "#fafbff",
    border: "1.5px solid #e4e8f0",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  deleteBtn: {
    padding: "18px",
    fontSize: "18px",
    color: "#1a2ea8",
    background: "#eef2ff",
    border: "1.5px solid #c7d2fe",
    borderRadius: "14px",
    cursor: "pointer",
  },
  forgotBtn: {
    background: "none",
    border: "none",
    color: "#1a2ea8",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "12px",
  },
  input: {
    padding: "12px 14px",
    border: "1.5px solid #e4e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "'Inter',sans-serif",
    color: "#1a1a2e",
    background: "#fafbff",
    outline: "none",
    textAlign: "center",
    letterSpacing: "6px",
  },
  btn: {
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
  divider: {
    borderTop: "1px solid #e4e8f0",
    margin: "20px 0 16px",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "#999",
    fontSize: "13px",
    cursor: "pointer",
  },
};

export default PinLock;