import { useState } from "react";
import { Link } from "react-router-dom";

const visionItems = [
  {
    icon: "🌍",
    title: "Universal Access",
    desc: "Financial wellness tools should be available to everyone, regardless of income level.",
  },
  {
    icon: "📈",
    title: "Financial Empowerment",
    desc: "We see a future where individuals feel confident and empowered in their financial decisions.",
  },
  {
    icon: "✅",
    title: "Simplified Finance",
    desc: "We envision removing the intimidation factor from personal finance.",
  },
];

const missionItems = [
  {
    icon: "⏰",
    title: "Simplify Daily Tracking",
    desc: "Make expense tracking effortless with intuitive interfaces.",
  },
  {
    icon: "📊",
    title: "Provide Clear Insights",
    desc: "Transform raw data into meaningful insights through visual analytics.",
  },
  {
    icon: "🔒",
    title: "Ensure Privacy & Security",
    desc: "Protect user data with industry-leading security measures.",
  },
  {
    icon: "⚡",
    title: "Continuous Innovation",
    desc: "Stay ahead of user needs by continuously improving our platform.",
  },
];

const Vision = () => {
  const [activeTab, setActiveTab] = useState("vision");
  const isVision = activeTab === "vision";
  const items = isVision ? visionItems : missionItems;

  return (
    <div style={s.appBody}>
      <div
        style={{
          background: "#eef0f7",
          minHeight: "calc(100vh - 60px)",
          paddingBottom: "60px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "40px 40px 20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              alignItems: "end",
              marginBottom: "28px",
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "2.8rem",
                  fontWeight: "800",
                  color: "#1a1a2e",
                  lineHeight: 1.1,
                  marginBottom: "14px",
                }}
              >
                {isVision ? "Our Vision" : "Our Mission"}
              </h1>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#1a2ea8",
                  fontWeight: "600",
                  lineHeight: 1.65,
                }}
              >
                {isVision
                  ? "Empowering individuals to take control of their financial future."
                  : "To provide intuitive tools that simplify expense tracking."}
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "white",
                borderRadius: "10px",
                border: "1px solid #e4e8f0",
                overflow: "hidden",
                alignSelf: "start",
              }}
            >
              {["vision", "mission"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "14px 20px",
                    border: "none",
                    fontFamily: "'Sora',sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    background: activeTab === tab ? "#1a2ea8" : "white",
                    color: activeTab === tab ? "white" : "#666",
                  }}
                >
                  Our {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e4e8f0",
                padding: "32px",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: "12px",
                }}
              >
                {isVision
                  ? "A World of Financial Clarity"
                  : "Driving Financial Wellness"}
              </h2>
              <p
                style={{
                  fontSize: "0.93rem",
                  color: "#1a2ea8",
                  fontWeight: "500",
                  lineHeight: 1.65,
                  marginBottom: "24px",
                }}
              >
                {isVision
                  ? "We envision a world where everyone has tools to make informed financial decisions."
                  : "Our mission is to transform the way people interact with their finances."}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {items.map((item) => (
                  <div
                    key={item.title}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      background: "#f7f8fc",
                      borderRadius: "10px",
                      padding: "18px",
                      border: "1px solid #e4e8f0",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        minWidth: "38px",
                        background: "#1a2ea8",
                        borderRadius: "9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: "'Sora',sans-serif",
                          fontSize: "0.95rem",
                          fontWeight: "700",
                          color: "#1a1a2e",
                          marginBottom: "5px",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.86rem",
                          color: "#666",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                background: "#1a2ea8",
                borderRadius: "14px",
                padding: "30px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "14px",
                }}
              >
                {isVision ? "Our Long-Term Vision" : "Our Commitment to You"}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.75,
                }}
              >
                {isVision
                  ? "By 2030, we aim to be the most trusted personal finance companion for millions of users worldwide."
                  : "We are committed to being more than just an expense tracking app — your trusted financial partner."}
              </p>
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
        }}
      >
        © 2024 Trackify. All rights reserved.
      </footer>
    </div>
  );
};

const s = {
  appBody: {
    background: "#eef0f7",
    minHeight: "100vh",
    fontFamily: "'Inter',sans-serif",
  },
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
};

export default Vision;
