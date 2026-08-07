import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const SetPin = () => {
  const { user, verifyPin, updateUser } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState([]);
  const [confirm, setConfirm] = useState([]);
  const [step, setStep] = useState("set");
  const [shake, setShake] = useState(false);

  const handleNumber = (num) => {
    if (step === "set") {
      if (pin.length >= 4) return;
      const newPin = [...pin, num];
      setPin(newPin);
      if (newPin.length === 4) setTimeout(() => setStep("confirm"), 300);
    } else {
      if (confirm.length >= 4) return;
      const newConfirm = [...confirm, num];
      setConfirm(newConfirm);
      if (newConfirm.length === 4) setTimeout(() => handleSubmit([...pin], newConfirm), 300);
    }
  };

  const handleDelete = () => {
    if (step === "set") setPin(pin.slice(0, -1));
    else setConfirm(confirm.slice(0, -1));
  };

  const handleSubmit = async (pinArr, confirmArr) => {
    if (pinArr.join("") !== confirmArr.join("")) {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setConfirm([]);
        setStep("set");
        setPin([]);
        toast.error("PINs don't match, try again");
      }, 600);
      return;
    }
    try {
      await API.post("/api/auth/set-pin", { userId: user.id || user._id, pin: pinArr.join("") });

      // ✅ update user state and localStorage so PrivateRoute knows PIN is set
      const updatedUser = { ...user, pin: true };
      updateUser(updatedUser);

      toast.success("PIN set successfully!");
      verifyPin();
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to set PIN");
      setConfirm([]);
      setStep("set");
      setPin([]);
    }
  };

  const currentPin = step === "set" ? pin : confirm;

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>T</div>
          <span style={s.logoText}>Trackify</span>
        </div>
        <div style={s.iconCircle}>
          <span style={{ fontSize: "28px" }}>🔐</span>
        </div>
        <h1 style={s.title}>
          {step === "set" ? "Create PIN" : "Confirm PIN"}
        </h1>
        <p style={s.sub}>
          {step === "set"
            ? "Set a 4-digit PIN to secure your account every time you return."
            : "Enter the same PIN again to confirm."}
        </p>
        <div style={s.steps}>
          <div style={{ ...s.stepDot, background: "#1a2ea8" }} />
          <div style={{ ...s.stepLine, background: step === "confirm" ? "#1a2ea8" : "#e4e8f0" }} />
          <div style={{ ...s.stepDot, background: step === "confirm" ? "#1a2ea8" : "#e4e8f0" }} />
        </div>
        <div style={s.stepLabels}>
          <span style={{ ...s.stepLabel, color: "#1a2ea8" }}>Enter PIN</span>
          <span style={{ ...s.stepLabel, color: step === "confirm" ? "#1a2ea8" : "#aaa" }}>Confirm PIN</span>
        </div>
        <div style={{ ...s.dotsWrap, animation: shake ? "shake 0.5s" : "none" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              ...s.dot,
              background: i < currentPin.length ? "#1a2ea8" : "transparent",
              border: `2.5px solid ${i < currentPin.length ? "#1a2ea8" : "#c7d2fe"}`,
              transform: i < currentPin.length ? "scale(1.15)" : "scale(1)",
            }} />
          ))}
        </div>
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
        {step === "confirm" && (
          <button style={s.backBtn} onClick={() => { setStep("set"); setPin([]); setConfirm([]); }}>
            ← Re-enter PIN
          </button>
        )}
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
    marginBottom: "24px",
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
  iconCircle: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "22px",
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: "10px",
  },
  sub: {
    fontSize: "13px",
    color: "#888",
    lineHeight: 1.7,
    marginBottom: "24px",
    maxWidth: "300px",
    margin: "0 auto 24px",
  },
  steps: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0",
    marginBottom: "4px",
  },
  stepDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    transition: "background 0.3s",
  },
  stepLine: {
    width: "60px",
    height: "2px",
    transition: "background 0.3s",
  },
  stepLabels: {
    display: "flex",
    justifyContent: "center",
    gap: "52px",
    marginBottom: "28px",
  },
  stepLabel: {
    fontSize: "11px",
    fontWeight: "600",
    transition: "color 0.3s",
  },
  dotsWrap: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    marginBottom: "32px",
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
    marginBottom: "20px",
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
  backBtn: {
    background: "none",
    border: "none",
    color: "#1a2ea8",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
  },
};

export default SetPin;