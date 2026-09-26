import { useState } from "react";
import { VoiceEntryModal } from "./VoiceEntryModal";

export const VoiceEntryButton = ({ onVoiceComplete, customStyle, label = "Voice Input", subLabel = "Speak to add" }) => {
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
          background: "#e3ebff",
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
            background: "#1a2ea8",
            color: "white",
            fontSize: "24px",
          }}
        >
          🎤
        </div>
        <p
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: "0.92rem",
            fontWeight: "700",
            marginBottom: "5px",
            color: "#1a2ea8",
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: "0.77rem", color: "#4a6cf7" }}>{subLabel}</p>
      </div>

      <VoiceEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmSave={(parsedPayload) => {
          if (onVoiceComplete) {
            onVoiceComplete(parsedPayload);
          }
        }}
      />
    </>
  );
};
