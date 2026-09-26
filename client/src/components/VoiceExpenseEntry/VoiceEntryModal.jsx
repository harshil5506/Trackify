import { useState, useEffect } from "react";
import { useVoiceRecognition } from "../../hooks/useVoiceRecognition";
import { parseVoiceTranscriptApi } from "../../services/expenseParserService";
import { toDateTimeLocalValue } from "../../utils/finance";
import toast from "react-hot-toast";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Rent",
  "Other",
];

const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Net Banking", "Other"];

export const VoiceEntryModal = ({ isOpen, onClose, onConfirmSave }) => {
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    permissionDenied,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useVoiceRecognition();

  const [status, setStatus] = useState("idle"); // 'idle' | 'listening' | 'processing' | 'review' | 'error'
  const [parsedData, setParsedData] = useState(null);
  const [manualInput, setManualInput] = useState("");

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isListening) stopListening();
    resetTranscript();
    setStatus("idle");
    setParsedData(null);
    setManualInput("");
    onClose();
  };

  const handleStartRecording = () => {
    resetTranscript();
    setStatus("listening");
    startListening();
  };

  const handleStopAndParse = async () => {
    stopListening();
    const fullText = (transcript + " " + interimTranscript).trim() || manualInput.trim();

    if (!fullText) {
      toast.error("No spoken text captured. Please try speaking again.");
      return;
    }

    setStatus("processing");
    try {
      const result = await parseVoiceTranscriptApi(fullText, new Date().toISOString());
      setParsedData(result);
      setStatus("review");
    } catch (err) {
      toast.error(err.message || "Failed to process voice note.");
      setStatus("idle");
    }
  };

  const handleFieldChange = (key, value) => {
    setParsedData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleConfirm = () => {
    if (!parsedData || !parsedData.amount) {
      return toast.error("Please enter a valid amount.");
    }

    const payload = {
      title: parsedData.merchant || parsedData.description || "Voice Expense",
      amount: Number(parsedData.amount),
      category: parsedData.category || "Other",
      paymentMethod: parsedData.paymentMethod || "Cash",
      date: parsedData.date ? toDateTimeLocalValue(new Date(parsedData.date)) : toDateTimeLocalValue(new Date()),
      note: parsedData.description || `Spoken text: "${parsedData.rawTranscript}"`,
      merchant: parsedData.merchant || "",
      type: "expense",
    };

    onConfirmSave(payload);
    handleClose();
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div
        style={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Voice Expense Entry Modal"
      >
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>🎤 Voice Expense Entry</h3>
            <p style={styles.subtitle}>
              Speak your expense naturally (e.g. "Add 250 for groceries at Walmart today")
            </p>
          </div>
          <button style={styles.closeBtn} onClick={handleClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {status === "idle" && (
            <div style={styles.centerContainer}>
              {!isSupported ? (
                <div style={styles.warningBox}>
                  ⚠️ Speech recognition is not supported in this browser. You can type your sentence below or enter details manually.
                </div>
              ) : permissionDenied ? (
                <div style={styles.warningBox}>
                  🔒 Microphone permission was denied. Please allow mic access in browser settings or type your sentence manually below.
                </div>
              ) : null}

              {/* Push-to-Talk Mic Trigger */}
              <button
                type="button"
                style={{
                  ...styles.bigMicBtn,
                  background: isSupported ? "linear-gradient(135deg, #1a2ea8 0%, #3b82f6 100%)" : "#94a3b8",
                }}
                onClick={handleStartRecording}
                disabled={!isSupported && false}
              >
                🎤
              </button>
              <h4 style={styles.micInstruction}>
                {isSupported ? "Tap to Start Speaking" : "Type your sentence below"}
              </h4>
              <p style={styles.micSubInstruction}>
                Try saying: <em>"Spent 500 rupees on cab to airport yesterday"</em>
              </p>

              {/* Manual Sentence Fallback Input */}
              <div style={styles.manualInputGroup}>
                <label style={styles.label}>Or type your sentence:</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. Paid 1500 for electricity bill"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    style={styles.primaryBtn}
                    onClick={handleStopAndParse}
                    disabled={!manualInput.trim()}
                  >
                    Parse
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === "listening" && (
            <div style={styles.centerContainer}>
              {/* Active Listening Mic with pulse */}
              <div style={styles.activeMicPulse}>
                <button
                  type="button"
                  style={{
                    ...styles.bigMicBtn,
                    background: "#dc2626",
                    boxShadow: "0 0 0 16px rgba(220, 38, 38, 0.2)",
                  }}
                  onClick={handleStopAndParse}
                >
                  🛑
                </button>
              </div>

              {/* Waveform Visualizer */}
              <div style={styles.waveformRow}>
                <div style={{ ...styles.waveBar, animationDelay: "0s" }} />
                <div style={{ ...styles.waveBar, animationDelay: "0.2s" }} />
                <div style={{ ...styles.waveBar, animationDelay: "0.4s" }} />
                <div style={{ ...styles.waveBar, animationDelay: "0.1s" }} />
                <div style={{ ...styles.waveBar, animationDelay: "0.3s" }} />
              </div>

              <h4 style={styles.listeningTitle}>Listening… Tap red button when done</h4>

              {/* Real-time Interim Captions */}
              <div style={styles.captionBox}>
                <p style={styles.captionText}>
                  {transcript} <span style={styles.interimText}>{interimTranscript}</span>
                  {!transcript && !interimTranscript && (
                    <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                      Listening for your voice… speak clearly now
                    </span>
                  )}
                </p>
              </div>

              {error && <p style={styles.errorText}>{error}</p>}

              <button type="button" style={styles.primaryBtn} onClick={handleStopAndParse}>
                Done Speaking → Extract Details
              </button>
            </div>
          )}

          {status === "processing" && (
            <div style={styles.centerContainer}>
              <div style={styles.spinner} />
              <h4 style={styles.loadingTitle}>Analyzing your voice note…</h4>
              <p style={styles.loadingSub}>Extracting amount, category, merchant & dates.</p>
            </div>
          )}

          {status === "review" && parsedData && (
            <div style={styles.reviewContainer}>
              {/* Low Confidence Banner */}
              {(!parsedData.amount || parsedData.confidence?.overall < 0.70) && (
                <div style={styles.warningBanner}>
                  ⚠️ <strong>Needs Verification:</strong>{" "}
                  {!parsedData.amount
                    ? "Amount could not be extracted automatically. Please enter the amount."
                    : "Some fields have low confidence. Please double-check before saving."}
                </div>
              )}

              {/* Raw Transcript Display */}
              <div style={styles.transcriptPreview}>
                <span style={{ fontWeight: "600", color: "#475569" }}>Heard:</span> "{parsedData.rawTranscript}"
              </div>

              {/* Form Grid */}
              <div style={styles.reviewGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Amount ({parsedData.currency || "₹"}) *
                    {!parsedData.amount && <span style={styles.requiredBadge}>Required</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={parsedData.amount ?? ""}
                    onChange={(e) => handleFieldChange("amount", parseFloat(e.target.value) || 0)}
                    style={{
                      ...styles.input,
                      borderColor: !parsedData.amount ? "#dc2626" : "#cbd5e1",
                      fontWeight: "bold",
                      color: "#1a2ea8",
                    }}
                    placeholder="0.00"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    value={parsedData.category || "Other"}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    style={styles.input}
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Merchant / Store</label>
                  <input
                    type="text"
                    value={parsedData.merchant || ""}
                    onChange={(e) => handleFieldChange("merchant", e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Walmart, Starbucks"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Payment Method</label>
                  <select
                    value={parsedData.paymentMethod || "Cash"}
                    onChange={(e) => handleFieldChange("paymentMethod", e.target.value)}
                    style={styles.input}
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={parsedData.date ? toDateTimeLocalValue(new Date(parsedData.date)) : toDateTimeLocalValue(new Date())}
                    onChange={(e) => handleFieldChange("date", new Date(e.target.value).toISOString())}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Description / Note</label>
                  <input
                    type="text"
                    value={parsedData.description || ""}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    style={styles.input}
                    placeholder="Note details"
                  />
                </div>
              </div>

              {/* Re-record Action */}
              <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
                <button type="button" style={styles.reRecordBtn} onClick={handleStartRecording}>
                  🎤 Re-record Voice Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {status === "review" && (
          <div style={styles.footer}>
            <button type="button" style={styles.secondaryBtn} onClick={handleClose}>
              Cancel
            </button>
            <button type="button" style={styles.primaryBtn} onClick={handleConfirm}>
              ✅ Confirm & Save Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modalCard: {
    background: "#ffffff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "580px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "0.84rem",
    color: "#64748b",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    color: "#94a3b8",
    cursor: "pointer",
  },
  body: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  },
  centerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "20px 0",
  },
  bigMicBtn: {
    width: "84px",
    height: "84px",
    borderRadius: "50%",
    color: "white",
    fontSize: "36px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 15px -3px rgba(26, 46, 168, 0.3)",
    transition: "transform 0.2s ease",
  },
  activeMicPulse: {
    position: "relative",
    marginBottom: "16px",
  },
  micInstruction: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#1e293b",
    marginTop: "16px",
    marginBottom: "4px",
  },
  micSubInstruction: {
    fontSize: "0.82rem",
    color: "#64748b",
    marginBottom: "24px",
  },
  manualInputGroup: {
    width: "100%",
    marginTop: "20px",
    textAlign: "left",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "6px",
    display: "flex",
    justifyContent: "space-between",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
    outline: "none",
    background: "#ffffff",
    color: "#0f172a",
  },
  waveformRow: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    height: "36px",
    margin: "12px 0 16px",
  },
  waveBar: {
    width: "6px",
    height: "100%",
    background: "#3b82f6",
    borderRadius: "3px",
    animation: "wave 1s ease-in-out infinite alternate",
  },
  listeningTitle: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: "16px",
  },
  captionBox: {
    width: "100%",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px",
    minHeight: "70px",
    marginBottom: "20px",
    textAlign: "left",
  },
  captionText: {
    fontSize: "0.95rem",
    color: "#0f172a",
    margin: 0,
  },
  interimText: {
    color: "#3b82f6",
    fontStyle: "italic",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "0.84rem",
    marginBottom: "14px",
  },
  warningBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.84rem",
    marginBottom: "16px",
    width: "100%",
  },
  spinner: {
    width: "44px",
    height: "44px",
    border: "4px solid #e2e8f0",
    borderTopColor: "#1a2ea8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  loadingTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "4px",
  },
  loadingSub: {
    fontSize: "0.84rem",
    color: "#64748b",
  },
  reviewContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  warningBanner: {
    background: "#fffbe6",
    border: "1px solid #ffe58f",
    color: "#d48806",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.84rem",
  },
  transcriptPreview: {
    background: "#f1f5f9",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.86rem",
    color: "#334155",
  },
  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  requiredBadge: {
    color: "#dc2626",
    fontSize: "0.74rem",
  },
  reRecordBtn: {
    background: "none",
    border: "1px solid #1a2ea8",
    color: "#1a2ea8",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.82rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  primaryBtn: {
    background: "#1a2ea8",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "10px 20px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    background: "#f8fafc",
  },
};
