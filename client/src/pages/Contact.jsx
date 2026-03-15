import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const faqs = [
  {
    q: "How quickly do you respond?",
    a: "Our support team typically responds within 24 hours on business days.",
  },
  {
    q: "What information should I include?",
    a: "Please include your account email, a clear description of the issue, and any screenshots.",
  },
  {
    q: "Do you offer phone support?",
    a: "Yes! Phone support is available Mon–Fri from 9 AM to 6 PM EST.",
  },
];

const Contact = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [openFaq, setOpenFaq] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setSending(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <div
      style={{
        background: "#eef0f7",
        minHeight: "100vh",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      <nav style={s.appNav}>
        <div style={s.appNavBrand}>
          <div style={s.appLogoFallback}>T</div>
          <span style={s.appBrandName}>Trackify</span>
        </div>
        <ul style={s.appNavLinks}>
          <li>
            <Link to="/dashboard" style={s.appNavLink}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/add-expense" style={s.appNavLink}>
              Add Expense
            </Link>
          </li>
          <li>
            <Link to="/transactions" style={s.appNavLink}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/reports" style={s.appNavLink}>
              Reports
            </Link>
          </li>
          <li>
            <Link to="/budget" style={s.appNavLink}>
              Budget
            </Link>
          </li>
        </ul>
        <div style={s.appNavRight}>
          <button style={s.notifBtn}>
            🔔<span style={s.notifBadge}>2</span>
          </button>
          <div style={s.appUserChip}>
            <div style={s.appAvatar}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span style={s.appUsername}>{user?.name || "User"}</span>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "60px 40px 20px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "2.4rem",
            fontWeight: "800",
            color: "#1a1a2e",
            textAlign: "center",
            marginBottom: "14px",
          }}
        >
          Get in Touch
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#666",
            textAlign: "center",
            maxWidth: "540px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Have a question or feedback? We'd love to hear from you.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          {[
            {
              icon: "📧",
              title: "Email",
              val: "support@trackify.com",
              sub: "We'll respond within 24 hours",
            },
            {
              icon: "📞",
              title: "Phone",
              val: "+1 234 567 8900",
              sub: "Mon–Fri, 9 AM – 6 PM EST",
            },
            {
              icon: "📍",
              title: "Location",
              val: "1234 Office St, Suite 567",
              sub: "",
            },
          ].map((info) => (
            <div
              key={info.title}
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "24px 22px",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                boxShadow: "0 2px 12px rgba(26,46,168,0.07)",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  minWidth: "46px",
                  background: "linear-gradient(135deg,#2d47c9,#1a2ea8)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                {info.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: "4px",
                  }}
                >
                  {info.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "#1a1a2e",
                    fontWeight: "500",
                    marginBottom: "2px",
                  }}
                >
                  {info.val}
                </p>
                <span style={{ fontSize: "0.8rem", color: "#666" }}>
                  {info.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "36px",
              boxShadow: "0 2px 12px rgba(26,46,168,0.07)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1.4rem",
                fontWeight: "700",
                color: "#1a1a2e",
                marginBottom: "6px",
              }}
            >
              Send us a Message
            </h2>
            <p
              style={{
                fontSize: "0.88rem",
                color: "#666",
                marginBottom: "28px",
              }}
            >
              Fill out the form and we'll contact you within 24 hours.
            </p>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                    }}
                  >
                    Your Name*
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    style={s.formInput}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#1a1a2e",
                    }}
                  >
                    Your Email*
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    required
                    style={s.formInput}
                  />
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "7px" }}
              >
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}
                >
                  Subject*
                </label>
                <select
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  required
                  style={s.formInput}
                >
                  <option value="" disabled>
                    Choose a subject...
                  </option>
                  {[
                    "General Inquiry",
                    "Technical Support",
                    "Billing",
                    "Partnership",
                    "Other",
                  ].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "7px" }}
              >
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}
                >
                  Message*
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  rows={5}
                  placeholder="Type your message here..."
                  required
                  style={{
                    ...s.formInput,
                    resize: "vertical",
                    minHeight: "110px",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                style={{
                  background: "linear-gradient(135deg,#2d47c9,#1a2ea8)",
                  color: "white",
                  border: "none",
                  padding: "13px 36px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  fontFamily: "'Sora',sans-serif",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
          <div>
            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "white",
                background: "linear-gradient(135deg,#2d47c9,#1a2ea8)",
                padding: "22px 24px",
                borderRadius: "16px 16px 0 0",
                margin: 0,
              }}
            >
              Frequently Asked Questions
            </h2>
            <div
              style={{ background: "linear-gradient(160deg,#1e3ab5,#1a2ea8)" }}
            >
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "18px 24px",
                      textAlign: "left",
                      fontFamily: "'Inter',sans-serif",
                      fontSize: "0.92rem",
                      fontWeight: "500",
                      color: "rgba(255,255,255,0.88)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {faq.q}
                    <span
                      style={{
                        fontSize: "1.2rem",
                        transition: "transform 0.25s",
                        display: "inline-block",
                        transform: openFaq === i ? "rotate(45deg)" : "none",
                      }}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "0 24px 18px" }}>
                      <p
                        style={{
                          fontSize: "0.88rem",
                          color: "rgba(255,255,255,0.7)",
                          lineHeight: 1.6,
                        }}
                      >
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              style={{
                background: "linear-gradient(160deg,#1e3ab5,#1a2ea8)",
                borderRadius: "0 0 16px 16px",
                padding: "24px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "6px",
                }}
              >
                Still have questions?
              </h3>
              <p
                style={{
                  fontSize: "0.87rem",
                  color: "rgba(255,255,255,0.65)",
                  marginBottom: "18px",
                }}
              >
                Our support team is here to help.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  style={{
                    background: "white",
                    color: "#1a2ea8",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    fontFamily: "'Sora',sans-serif",
                    cursor: "pointer",
                  }}
                >
                  Start Live Chat
                </button>
                <button
                  style={{
                    background: "transparent",
                    color: "white",
                    border: "1.5px solid rgba(255,255,255,0.5)",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    fontFamily: "'Sora',sans-serif",
                    cursor: "pointer",
                  }}
                >
                  Schedule a Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          fontSize: "14px",
          color: "#666",
          borderTop: "1px solid #e4e8f0",
          background: "white",
          marginTop: "40px",
        }}
      >
        © 2025 Trackify. All rights reserved.
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
  formInput: {
    padding: "11px 14px",
    border: "1.5px solid #e4e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontFamily: "'Inter',sans-serif",
    color: "#1a1a2e",
    background: "#fafbff",
    outline: "none",
  },
};

export default Contact;
