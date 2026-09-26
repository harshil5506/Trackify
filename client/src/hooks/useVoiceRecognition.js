import { useState, useEffect, useRef, useCallback } from "react";

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setPermissionDenied(false);
    };

    recognition.onresult = (event) => {
      let finalStr = "";
      let interimStr = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalStr += result[0].transcript + " ";
        } else {
          interimStr += result[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript((prev) => (prev + " " + finalStr).trim());
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setPermissionDenied(true);
        setError("Microphone permission was denied. Please allow mic access or use manual input.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please speak clearly into your microphone.");
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      if (!isSupported) {
        setError("Speech recognition is not supported in this browser. Please use Chrome/Edge or manual entry.");
      }
      return;
    }
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
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
  };
};
