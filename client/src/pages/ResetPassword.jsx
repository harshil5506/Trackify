// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import API from "../api/axios";
// import toast from "react-hot-toast";

// const ResetPassword = () => {
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       await API.post(`/api/auth/reset-password/${token}`, { password });
//       toast.success("Password updated!");
//       navigate("/login");
//     } catch (err) {
//       toast.error("Invalid or expired link");
//     }
//   };

//   return (
//     <div>
//       <h2>Reset Password</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="password"
//           placeholder="New password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button type="submit">Reset</button>
//       </form>
//     </div>
//   );
// };

// export default ResetPassword;

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isStrongPassword = (value) => {
    const password = String(value || "");
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (!isStrongPassword(password)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      );
      return;
    }
    setLoading(true);
    try {
      await API.post(`/api/auth/reset-password/${token}`, { password });
      setDone(true);
      toast.success("Password updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired link");
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

        {!done ? (
          <>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              🔑
            </div>
            <h1 style={s.title}>Set New Password</h1>
            <p style={s.sub}>Enter your new password below. Make it strong!</p>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={s.input}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{
                    ...s.input,
                    borderColor:
                      confirm && password !== confirm ? "#ef4444" : "#e4e8f0",
                  }}
                />
                {confirm && password !== confirm && (
                  <span style={s.errorText}>Passwords don't match</span>
                )}
              </div>
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? "Updating..." : "Reset Password"}
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
              🎉
            </div>
            <h1 style={s.title}>Password Updated!</h1>
            <p style={s.sub}>
              Your password has been reset successfully. You can now sign in
              with your new password.
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                background: "#f0fff4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "20px",
              }}
            >
              <span style={{ fontSize: "16px" }}>✅</span>
              <p
                style={{
                  fontSize: "13px",
                  color: "#166534",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                All done! Your account is secured with the new password.
              </p>
            </div>
            <button style={s.btn} onClick={() => navigate("/login")}>
              Go to Login
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
  errorText: {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "2px",
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

export default ResetPassword;
