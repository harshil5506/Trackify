import { Link } from "react-router-dom";
import logo from "../assets/logo_final.jpeg";

const Footer = () => {
  return (
    <footer style={s.footer}>
      <div style={s.footerInner}>
        {/* Brand Section */}
        <div style={s.footerBrand}>
          <img
            src={logo}
            alt="Trackify"
            style={{
              height: "48px",
              width: "48px",
              objectFit: "contain",
              borderRadius: "10px",
              background: "white",
              padding: "4px",
              flexShrink: 0,
            }}
          />
          <div>
            <p style={s.footerBrandName}>Trackify</p>
            <p style={s.footerTagline}>Smart expense tracking for everyone</p>
          </div>
        </div>

        {/* Links Section */}
        <div style={s.footerLinks}>
          {/* Company */}
          <div style={s.footerCol}>
            <p style={s.footerColTitle}>Company</p>
            <Link to="/about" style={s.footerLink}>
              About Us
            </Link>
            <Link to="/vision" style={s.footerLink}>
              Our Vision
            </Link>
            <Link to="/contact" style={s.footerLink}>
              Contact
            </Link>
          </div>

          {/* Features */}
          <div style={s.footerCol}>
            <p style={s.footerColTitle}>Features</p>
            <Link to="/dashboard" style={s.footerLink}>
              Dashboard
            </Link>
            <Link to="/transactions" style={s.footerLink}>
              Transactions
            </Link>
            <Link to="/budget" style={s.footerLink}>
              Budget
            </Link>
            <Link to="/groups" style={s.footerLink}>
              Groups
            </Link>
          </div>

          {/* Quick Links */}
          <div style={s.footerCol}>
            <p style={s.footerColTitle}>Quick Links</p>
            <Link to="/add-expense" style={s.footerLink}>
              Add Expense
            </Link>
            <Link to="/reports" style={s.footerLink}>
              Reports
            </Link>
            <Link to="/friends" style={s.footerLink}>
              Friends
            </Link>
            <Link to="/profile" style={s.footerLink}>
              Profile
            </Link>
          </div>

          {/* Contact Info */}
          <div style={s.footerCol}>
            <p style={s.footerColTitle}>Contact Us</p>
            <p style={s.footerText}>📧 trackify.services@gmail.com </p>
            <p style={s.footerText}>📞 +91 98765 43210</p>
            <p style={s.footerText}>📍 Vadodara, Gujarat, India</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              {["𝕏", "in", "gh"].map((icon) => (
                <div key={icon} style={s.socialIcon}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={s.footerBottom}>
        <div style={s.footerBottomInner}>
          <p style={s.footerCopy}>
            © {new Date().getFullYear()} Trackify. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link to="/about" style={s.footerBottomLink}>
              Privacy Policy
            </Link>
            <Link to="/about" style={s.footerBottomLink}>
              Terms of Service
            </Link>
            <Link to="/contact" style={s.footerBottomLink}>
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const s = {
  footer: {
    background: "#1a1a2e",
    color: "white",
    marginTop: "auto",
  },
  footerInner: {
    maxWidth: "1060px",
    margin: "0 auto",
    padding: "48px 28px 32px",
    display: "flex",
    gap: "60px",
    flexWrap: "wrap",
  },
  footerBrand: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    flex: "0 0 220px",
  },
  footerBrandName: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    color: "white",
    marginBottom: "4px",
  },
  footerTagline: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.5)",
    maxWidth: "160px",
    lineHeight: "1.4",
  },
  footerLinks: {
    display: "flex",
    gap: "48px",
    flex: 1,
    flexWrap: "wrap",
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "120px",
  },
  footerColTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: "0.82rem",
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
  },
  footerLink: {
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
  },
  footerText: {
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.6)",
  },
  socialIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "white",
    cursor: "pointer",
  },
  footerBottom: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  footerBottomInner: {
    maxWidth: "1060px",
    margin: "0 auto",
    padding: "16px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
  },
  footerCopy: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.4)",
  },
  footerBottomLink: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.4)",
    textDecoration: "none",
  },
};

export default Footer;
