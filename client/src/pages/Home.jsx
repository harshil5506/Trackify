import { useState } from "react";
import { Link } from "react-router-dom";

const testimonials = [
  {
    initials: "SJ",
    quote:
      "Trackify has revolutionized how we manage our finances. The real-time tracking improved our productivity by 40%.",
    name: "Sarah Johnson",
    role: "Product Manager at TechCorp",
  },
  {
    initials: "MR",
    quote:
      "The analytics dashboard alone is worth it. We finally have visibility into every aspect of our spending.",
    name: "Mark Rivera",
    role: "CTO at StartupHub",
  },
  {
    initials: "AL",
    quote:
      "Our team collaboration has never been this smooth. Trackify keeps everyone aligned no matter where they are.",
    name: "Aisha Lee",
    role: "Operations Lead at RemoteWorks",
  },
];

const features = [
  {
    icon: "✅",
    title: "Real-Time Tracking",
    desc: "Monitor your expenses in real-time with live updates and instant notifications.",
  },
  {
    icon: "📊",
    title: "Advanced Analytics",
    desc: "Gain deep insights with comprehensive analytics and customizable reports.",
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    desc: "Split expenses with friends and groups seamlessly.",
  },
  {
    icon: "🔒",
    title: "Enterprise Security",
    desc: "Bank-level encryption to keep your financial data safe at all times.",
  },
  {
    icon: "📈",
    title: "Performance Metrics",
    desc: "Track spending KPIs with customizable dashboards.",
  },
  {
    icon: "💬",
    title: "24/7 Support",
    desc: "Get help whenever you need it with our dedicated support team.",
  },
];

const Home = () => {
  const [current, setCurrent] = useState(0);

  return (
    <div
      style={{
        fontFamily: "'Inter',sans-serif",
        color: "#1a1a2e",
        background: "#fff",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 60px",
          background: "#1a2ea8",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#4a6cf7",
              color: "#fff",
              fontSize: "22px",
              fontWeight: "700",
              fontFamily: "'Sora',sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            T
          </div>
          <span
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "22px",
              fontWeight: "700",
              color: "#fff",
            }}
          >
            Trackify
          </span>
        </div>
        <ul
          style={{
            display: "flex",
            gap: "36px",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          <li>
            <a
              href="#home"
              style={{
                color: "#fff",
                fontSize: "15px",
                fontWeight: "500",
                textDecoration: "none",
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#features"
              style={{
                color: "#fff",
                fontSize: "15px",
                fontWeight: "500",
                textDecoration: "none",
              }}
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#testimonials"
              style={{
                color: "#fff",
                fontSize: "15px",
                fontWeight: "500",
                textDecoration: "none",
              }}
            >
              Testimonials
            </a>
          </li>
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            to="/login"
            style={{
              color: "#fff",
              fontSize: "15px",
              fontWeight: "500",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            style={{
              background: "#fff",
              color: "#1a2ea8",
              padding: "10px 22px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              textDecoration: "none",
              fontFamily: "'Sora',sans-serif",
            }}
          >
            Get Started Free
          </Link>
        </div>
      </nav>
      <section
        id="home"
        style={{
          background:
            "linear-gradient(135deg,#1a2ea8 0%,#2d47c9 60%,#4a6cf7 100%)",
          padding: "100px 20px 90px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: "750px", margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "clamp(36px,6vw,64px)",
              fontWeight: "800",
              lineHeight: 1.15,
              marginBottom: "24px",
              letterSpacing: "-0.5px",
            }}
          >
            Track Smart, Spend Better
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "rgba(255,255,255,0.88)",
              maxWidth: "520px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Powerful expense tracking and analytics platform designed to help
            you manage finances efficiently.
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/signup"
              style={{
                background: "#fff",
                color: "#1a2ea8",
                padding: "14px 30px",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                fontFamily: "'Sora',sans-serif",
                textDecoration: "none",
              }}
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              style={{
                background: "transparent",
                color: "#fff",
                border: "2px solid #fff",
                padding: "14px 30px",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                fontFamily: "'Sora',sans-serif",
                textDecoration: "none",
              }}
            >
              See Features
            </a>
          </div>
        </div>
      </section>
      <section style={{ background: "#fff", padding: "60px 20px" }}>
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "20px",
            textAlign: "center",
          }}
        >
          {[
            { v: "50K+", l: "Active Users" },
            { v: "99.9%", l: "Uptime" },
            { v: "24/7", l: "Support" },
            { v: "150+", l: "Countries" },
          ].map((s) => (
            <div key={s.l}>
              <h2
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "42px",
                  fontWeight: "800",
                  color: "#1a2ea8",
                }}
              >
                {s.v}
              </h2>
              <p style={{ color: "#666", fontSize: "14px", marginTop: "6px" }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        id="features"
        style={{ background: "#fff", padding: "70px 20px" }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto 56px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "36px",
              fontWeight: "800",
              marginBottom: "14px",
            }}
          >
            Powerful Features
          </h2>
          <p style={{ color: "#666", fontSize: "15px", lineHeight: 1.7 }}>
            Everything you need to track, manage, and optimize your finances
          </p>
        </div>
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "24px",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#f7f8fc",
                borderRadius: "16px",
                padding: "30px 26px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "#2d47c9",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  fontSize: "24px",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "10px",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        id="testimonials"
        style={{ background: "#f0f3ff", padding: "80px 20px" }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto 40px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: "36px",
              fontWeight: "800",
              marginBottom: "14px",
            }}
          >
            What Our Customers Say
          </h2>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            maxWidth: "780px",
            margin: "0 auto 24px",
          }}
        >
          <button
            onClick={() =>
              setCurrent(
                (p) => (p - 1 + testimonials.length) % testimonials.length,
              )
            }
            style={{
              background: "#fff",
              border: "1px solid #e4e8f0",
              borderRadius: "50%",
              width: "42px",
              height: "42px",
              fontSize: "22px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ‹
          </button>
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "40px 48px",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              flex: 1,
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#2d47c9",
                color: "#fff",
                fontSize: "20px",
                fontWeight: "700",
                fontFamily: "'Sora',sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              {testimonials[current].initials}
            </div>
            <p
              style={{
                fontSize: "16px",
                color: "#1a1a2e",
                lineHeight: 1.75,
                marginBottom: "20px",
                fontStyle: "italic",
              }}
            >
              "{testimonials[current].quote}"
            </p>
            <strong
              style={{
                display: "block",
                fontFamily: "'Sora',sans-serif",
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              {testimonials[current].name}
            </strong>
            <span style={{ fontSize: "13px", color: "#666" }}>
              {testimonials[current].role}
            </span>
          </div>
          <button
            onClick={() => setCurrent((p) => (p + 1) % testimonials.length)}
            style={{
              background: "#fff",
              border: "1px solid #e4e8f0",
              borderRadius: "50%",
              width: "42px",
              height: "42px",
              fontSize: "22px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ›
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {testimonials.map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                cursor: "pointer",
                background: i === current ? "#2d47c9" : "#e4e8f0",
              }}
            />
          ))}
        </div>
      </section>
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          fontSize: "14px",
          color: "#666",
          borderTop: "1px solid #e4e8f0",
          background: "#fff",
        }}
      >
        <p>© 2024 Trackify. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
