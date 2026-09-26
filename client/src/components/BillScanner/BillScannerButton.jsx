import { useState } from "react";
import { BillScannerModal } from "./BillScannerModal";

export const BillScannerButton = ({ onScanComplete, customStyle, label = "Scan Receipt", subLabel = "Upload receipt" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        style={{
          borderRadius: "12px",
          padding: "30px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: "#fdf3d0",
          border: "2px solid transparent",
          transition: "transform 0.15s ease",
          ...customStyle,
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
            background: "#7c3000",
            fontSize: "24px",
          }}
        >
          📷
        </div>
        <p
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "0.92rem",
            fontWeight: "700",
            marginBottom: "5px",
            color: "#7c3000",
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: "0.77rem", color: "#b45309" }}>{subLabel}</p>
      </div>

      <BillScannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmSave={(scannedData) => {
          if (onScanComplete) {
            onScanComplete(scannedData);
          }
        }}
      />
    </>
  );
};
