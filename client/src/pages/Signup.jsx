import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/register", form);
      login(data.user, data.token);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.logo}>Trackify</h1>
        <h2 style={s.title}>Create account</h2>
        <p style={s.sub}>Start tracking your expenses today</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input
              style={s.input}
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
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
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p style={s.bottom}>
          Already have an account?{" "}
          <Link to="/login" style={s.link}>
            Sign in
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
    marginTop: "4px",
  },
  bottom: {
    color: "#666",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "24px",
  },
  link: {
    color: "#1a2ea8",
    fontSize: "13px",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Signup;
