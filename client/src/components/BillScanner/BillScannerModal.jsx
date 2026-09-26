import { useEffect, useRef, useState } from "react";
import { useBillScanner } from "../../hooks/useBillScanner";
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

export const BillScannerModal = ({ isOpen, onClose, onConfirmSave }) => {
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const {
    status,
    previewUrl,
    extractedData,
    errorMessage,
    handleFileSelect,
    processFile,
    retryScan,
    updateField,
    addLineItem,
    removeLineItem,
    updateLineItem,
    resetScanner,
  } = useBillScanner();

  // Category prediction based on merchant or line items
  const suggestCategory = (merchantName, text) => {
    const combined = `${merchantName || ""} ${text || ""}`.toLowerCase();
    if (combined.includes("mart") || combined.includes("grocery") || combined.includes("food") || combined.includes("cafe") || combined.includes("restaurant") || combined.includes("starbucks") || combined.includes("pizza")) {
      return "Food";
    }
    if (combined.includes("fuel") || combined.includes("uber") || combined.includes("ola") || combined.includes("petrol") || combined.includes("metro")) {
      return "Transportation";
    }
    if (combined.includes("amazon") || combined.includes("zara") || combined.includes("retail") || combined.includes("mall")) {
      return "Shopping";
    }
    if (combined.includes("power") || combined.includes("electric") || combined.includes("bill") || combined.includes("water") || combined.includes("wifi")) {
      return "Bills & Utilities";
    }
    if (combined.includes("pharmacy") || combined.includes("hospital") || combined.includes("clinic") || combined.includes("meds")) {
      return "Healthcare";
    }
    return "Bills & Utilities";
  };

  // Keyboard trap & Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      stopWebcam();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        setIsCameraActive(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((e) => console.log("Play error:", e));
          }
        }, 150);
      } else {
        cameraInputRef.current?.click();
      }
    } catch (err) {
      console.warn("Camera access failed, fallback to file input:", err.message);
      toast.error("Camera permissions not granted or camera busy. Opening file picker...");
      cameraInputRef.current?.click();
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureWebcamSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-receipt-${Date.now()}.png`, { type: "image/png" });
        stopWebcam();
        processFile(file);
      }
    }, "image/png");
  };

  const handleClose = () => {
    stopWebcam();
    resetScanner();
    onClose();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (!extractedData || !extractedData.total) {
      return toast.error("Please ensure a valid amount is entered.");
    }

    const suggestedCat = suggestCategory(extractedData.merchant, extractedData.rawText);

    const payload = {
      merchant: extractedData.merchant || "Scanned Receipt",
      title: extractedData.merchant || "Scanned Receipt",
      amount: Number(extractedData.total) || 0,
      category: extractedData.category || suggestedCat,
      paymentMethod: extractedData.paymentMethod || "Cash",
      date: extractedData.date ? toDateTimeLocalValue(new Date(extractedData.date)) : toDateTimeLocalValue(new Date()),
      note: `Scanned Bill (${extractedData.currency || "₹"}${extractedData.total}) - ${extractedData.lineItems?.map(l => l.description).join(", ") || "No line items"}`,
      type: "expense",
      lineItems: extractedData.lineItems || [],
    };

    onConfirmSave(payload);
    handleClose();
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div
        ref={modalRef}
        style={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Scan Bill & Receipt Modal"
        tabIndex={-1}
      >
        {/* Modal Header */}
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>📷 OCR Bill & Receipt Scanner</h3>
            <p style={styles.subtitle}>
              Capture or upload your receipt to automatically extract expense details.
            </p>
          </div>
          <button style={styles.closeBtn} onClick={handleClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Modal Body depending on Status */}
        <div style={styles.body}>
          {status === "idle" && (
            isCameraActive ? (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <div style={{ position: "relative", width: "100%", maxHeight: "360px", borderRadius: "12px", overflow: "hidden", background: "#0f172a" }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: "360px", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
                  <button type="button" style={styles.primaryBtn} onClick={captureWebcamSnapshot}>
                    📸 Snap Receipt Photo
                  </button>
                  <button type="button" style={styles.secondaryBtn} onClick={stopWebcam}>
                    ✕ Cancel Camera
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  ...styles.dropZone,
                  borderColor: dragActive ? "#1a2ea8" : "#cbd5e1",
                  background: dragActive ? "#f0f4ff" : "#f8fafc",
                }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div style={styles.iconCircle}>🧾</div>
                <h4 style={styles.dropTitle}>Drag & drop your receipt or bill here</h4>
                <p style={styles.dropSub}>Supports JPG, PNG, WEBP & PDF (Max 10MB)</p>

                <div style={styles.btnRow}>
                  <button
                    type="button"
                    style={styles.primaryBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 Browse File
                  </button>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={startWebcam}
                  >
                    📸 Camera Capture
                  </button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
              </div>
            )
          )}


          {(status === "compressing" || status === "scanning") && (
            <div style={styles.loadingBox}>
              {previewUrl ? (
                <div style={styles.previewThumbContainer}>
                  <img src={previewUrl} alt="Bill Preview" style={styles.previewThumb} />
                  <div style={styles.scanline} />
                </div>
              ) : (
                <div style={styles.spinner} />
              )}
              <h4 style={styles.loadingTitle}>
                {status === "compressing" ? "Optimizing image client-side…" : "Reading your bill…"}
              </h4>
              <p style={styles.loadingSub}>
                Extracting merchant, totals, date, and line items with AI parsing.
              </p>
            </div>
          )}

          {status === "error" && (
            <div style={styles.errorBox}>
              <div style={styles.errorIcon}>⚠️</div>
              <h4 style={styles.errorTitle}>Could Not Read Receipt</h4>
              <p style={styles.errorMsg}>{errorMessage || "Something went wrong while scanning."}</p>
              <div style={styles.btnRow}>
                <button type="button" style={styles.primaryBtn} onClick={retryScan}>
                  🔄 Try Again
                </button>
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={() => {
                    handleClose();
                  }}
                >
                  ✍️ Enter Details Manually
                </button>
              </div>
            </div>
          )}

          {status === "review" && extractedData && (
            <div style={styles.reviewContainer}>
              {/* Confidence Banner */}
              {extractedData.confidence?.overall < 0.70 && (
                <div style={styles.warningBanner}>
                  ⚠️ <strong>Low Confidence OCR Detection:</strong> Some values may be unverified. Please double check highlighted fields below.
                </div>
              )}

              <div style={styles.reviewGrid}>
                {/* Form Fields */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Merchant / Store Name
                    {extractedData.confidence?.merchant < 0.70 && (
                      <span style={styles.lowBadge}>⚠️ Low Confidence</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={extractedData.merchant || ""}
                    onChange={(e) => updateField("merchant", e.target.value)}
                    style={{
                      ...styles.input,
                      borderColor: extractedData.confidence?.merchant < 0.70 ? "#f59e0b" : "#cbd5e1",
                    }}
                    placeholder="e.g. Walmart, Starbucks"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Total Amount ({extractedData.currency || "₹"}) *
                    {extractedData.confidence?.total < 0.70 && (
                      <span style={styles.lowBadge}>⚠️ Low Confidence</span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={extractedData.total ?? ""}
                    onChange={(e) => updateField("total", parseFloat(e.target.value) || 0)}
                    style={{
                      ...styles.input,
                      borderColor: extractedData.confidence?.total < 0.70 ? "#f59e0b" : "#cbd5e1",
                      fontWeight: "bold",
                      color: "#1a2ea8",
                    }}
                    placeholder="0.00"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Category
                  </label>
                  <select
                    value={extractedData.category || suggestCategory(extractedData.merchant, extractedData.rawText)}
                    onChange={(e) => updateField("category", e.target.value)}
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
                  <label style={styles.label}>
                    Payment Method
                  </label>
                  <select
                    value={extractedData.paymentMethod || "Cash"}
                    onChange={(e) => updateField("paymentMethod", e.target.value)}
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
                  <label style={styles.label}>
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={extractedData.date ? toDateTimeLocalValue(new Date(extractedData.date)) : toDateTimeLocalValue(new Date())}
                    onChange={(e) => updateField("date", new Date(e.target.value).toISOString())}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Subtotal / Tax info */}
              <div style={styles.subtaxRow}>
                <div>
                  <span style={styles.subtaxLabel}>Subtotal:</span>{" "}
                  <strong>{extractedData.currency || "₹"}{extractedData.subtotal ?? "N/A"}</strong>
                </div>
                <div>
                  <span style={styles.subtaxLabel}>Tax / GST:</span>{" "}
                  <strong>{extractedData.currency || "₹"}{extractedData.tax ?? "N/A"}</strong>
                </div>
              </div>

              {/* Line Items Table */}
              <div style={styles.lineItemsSection}>
                <div style={styles.lineHeader}>
                  <h5 style={styles.lineTitle}>Line Items ({extractedData.lineItems?.length || 0})</h5>
                  <button type="button" style={styles.addBtn} onClick={addLineItem}>
                    + Add Item
                  </button>
                </div>

                {extractedData.lineItems?.length === 0 ? (
                  <p style={styles.noItems}>No line items detected automatically. Click "+ Add Item" if needed.</p>
                ) : (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Description</th>
                          <th style={styles.th}>Qty</th>
                          <th style={styles.th}>Unit Price</th>
                          <th style={styles.th}>Amount</th>
                          <th style={styles.th}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedData.lineItems.map((item, idx) => (
                          <tr key={idx}>
                            <td style={styles.td}>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                                style={styles.tableInput}
                              />
                            </td>
                            <td style={{ ...styles.td, width: "60px" }}>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(idx, "quantity", e.target.value)}
                                style={styles.tableInput}
                              />
                            </td>
                            <td style={{ ...styles.td, width: "90px" }}>
                              <input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateLineItem(idx, "unitPrice", e.target.value)}
                                style={styles.tableInput}
                              />
                            </td>
                            <td style={{ ...styles.td, width: "90px" }}>
                              <input
                                type="number"
                                step="0.01"
                                value={item.amount}
                                onChange={(e) => updateLineItem(idx, "amount", e.target.value)}
                                style={styles.tableInput}
                              />
                            </td>
                            <td style={{ ...styles.td, width: "40px" }}>
                              <button
                                type="button"
                                style={styles.deleteBtn}
                                onClick={() => removeLineItem(idx)}
                                title="Remove line item"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
    maxWidth: "680px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
    padding: "4px 8px",
    borderRadius: "6px",
  },
  body: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  },
  dropZone: {
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "40px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  iconCircle: {
    fontSize: "42px",
    marginBottom: "12px",
  },
  dropTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "6px",
  },
  dropSub: {
    fontSize: "0.82rem",
    color: "#64748b",
    marginBottom: "20px",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
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
  loadingBox: {
    textAlign: "center",
    padding: "40px 20px",
  },
  spinner: {
    width: "44px",
    height: "44px",
    border: "4px solid #e2e8f0",
    borderTopColor: "#1a2ea8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  previewThumbContainer: {
    position: "relative",
    width: "160px",
    height: "200px",
    margin: "0 auto 16px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #cbd5e1",
  },
  previewThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  scanline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "#3b82f6",
    boxShadow: "0 0 8px #3b82f6",
    animation: "scanAnim 2s infinite ease-in-out",
  },
  loadingTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "6px",
  },
  loadingSub: {
    fontSize: "0.85rem",
    color: "#64748b",
  },
  errorBox: {
    textAlign: "center",
    padding: "30px 20px",
  },
  errorIcon: {
    fontSize: "40px",
    marginBottom: "12px",
  },
  errorTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: "6px",
  },
  errorMsg: {
    fontSize: "0.88rem",
    color: "#475569",
    marginBottom: "20px",
  },
  reviewContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  warningBanner: {
    background: "#fffbe6",
    border: "1px solid #ffe58f",
    color: "#d48806",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.84rem",
  },
  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#334155",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lowBadge: {
    fontSize: "0.72rem",
    color: "#b45309",
    background: "#fef3c7",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
    outline: "none",
    background: "#f8fafc",
  },
  subtaxRow: {
    display: "flex",
    gap: "24px",
    fontSize: "0.86rem",
    color: "#475569",
    background: "#f1f5f9",
    padding: "10px 14px",
    borderRadius: "8px",
  },
  subtaxLabel: {
    color: "#64748b",
  },
  lineItemsSection: {
    marginTop: "8px",
  },
  lineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  lineTitle: {
    fontSize: "0.92rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  addBtn: {
    background: "none",
    border: "1px solid #1a2ea8",
    color: "#1a2ea8",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "0.78rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  noItems: {
    fontSize: "0.82rem",
    color: "#94a3b8",
    fontStyle: "italic",
  },
  tableContainer: {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.82rem",
  },
  th: {
    background: "#f8fafc",
    padding: "8px 10px",
    textAlign: "left",
    fontWeight: "600",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "6px 8px",
    borderBottom: "1px solid #f1f5f9",
  },
  tableInput: {
    width: "100%",
    padding: "5px 6px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    fontSize: "0.82rem",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
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
