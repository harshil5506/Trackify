import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const isGoogleConfigured =
    Boolean(rawClientId) &&
    !rawClientId.includes("your_google_client_id") &&
    !rawClientId.includes("YOUR_GOOGLE_CLIENT_ID");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/login", form);
      login(data.user, data.token);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGoogleLogin = async () => {
    try {
      setLoading(true);
      const { data } = await API.post("/api/auth/google", {
        demoUser: {
          name: "Harshil Thakkar",
          email: "harshil.hitendra.may2006@gmail.com",
          picture: "https://lh3.googleusercontent.com/a/default-user",
        },
      });
      login(data.user, data.token);
      toast.success("Logged in with Google!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.logo}>Trackify</h1>
        <h2 style={s.title}>Welcome back</h2>
        <p style={s.sub}>Sign in to your account</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div style={s.forgot}>
            <Link to="/forgot-password" style={s.link}>
              Forgot password?
            </Link>
          </div>
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => setForm({ email: "harshil123@gmail.com", password: "Password123!" })}
            style={s.demoBtn}
          >
            ✨ Quick Fill Demo Credentials
          </button>
        </form>
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          {isGoogleConfigured ? (
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const { data } = await API.post("/api/auth/google", {
                    token: credentialResponse.credential,
                  });
                  login(data.user, data.token);
                  toast.success("Logged in with Google!");
                  navigate("/dashboard");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Google login failed");
                }
              }}
              onError={() => {
                toast.error("Google OAuth failed");
              }}
            />
          ) : (
            <button
              type="button"
              onClick={handleDemoGoogleLogin}
              style={s.googleFallbackBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "10px" }}>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
        <p style={s.bottom}>
          Don't have an account?{" "}
          <Link to="/signup" style={s.link}>
            Sign up
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
    background:
      "linear-gradient(135deg, #1a2ea8 0%, #2d47c9 60%, #4a6cf7 100%)",
    padding: "20px",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  logo: {
    color: "#1a2ea8",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "24px",
    textAlign: "center",
    fontFamily: "'Sora', sans-serif",
  },
  title: {
    color: "#1a1a2e",
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "6px",
    textAlign: "center",
    fontFamily: "'Sora', sans-serif",
  },
  sub: {
    color: "#666",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "28px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#1a1a2e", fontSize: "13px", fontWeight: "600" },
  input: {
    background: "#f9fafb",
    border: "1.5px solid #e4e8f0",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#1a1a2e",
    fontSize: "14px",
    outline: "none",
  },
  forgot: { textAlign: "right", marginTop: "-8px" },
  link: {
    color: "#1a2ea8",
    fontSize: "13px",
    textDecoration: "none",
    fontWeight: "600",
  },
  btn: {
    background: "#1a2ea8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
  },
  demoBtn: {
    background: "#f0f4ff",
    color: "#1a2ea8",
    border: "1px dashed #1a2ea8",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.2s ease",
  },
  googleFallbackBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    background: "#ffffff",
    color: "#3c4043",
    border: "1px solid #dadce0",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    fontFamily: "'Inter', sans-serif",
    transition: "background-color 0.2s, box-shadow 0.2s",
  },
  bottom: {
    color: "#666",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "24px",
  },
};

export default Login;
