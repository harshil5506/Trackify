import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "40px 20px",
            maxWidth: "600px",
            margin: "60px auto",
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #fee2e2",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            textAlign: "center",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚠️</div>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#991b1b",
              margin: "0 0 8px",
            }}
          >
            Something went wrong rendering this page
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "20px" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              background: "#1a2ea8",
              color: "white",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
