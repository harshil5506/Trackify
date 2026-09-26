import { useState, useCallback } from "react";
import { scanBillApi } from "../services/ocrService";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_DIMENSION = 2000;

export const useBillScanner = () => {
  const [status, setStatus] = useState("idle"); // 'idle' | 'compressing' | 'scanning' | 'review' | 'error'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Compress and resize image client-side before upload
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      if (file.type === "application/pdf") {
        // Return raw file reader for PDF if needed
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
              width = MAX_IMAGE_DIMENSION;
            } else {
              width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
              height = MAX_IMAGE_DIMENSION;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.filter = "contrast(1.25) brightness(1.05)";
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.90);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error("Failed to process image file."));
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage("File size exceeds 10MB limit. Please upload a smaller image.");
      setStatus("error");
      return;
    }

    if (
      !selectedFile.type.startsWith("image/") &&
      selectedFile.type !== "application/pdf"
    ) {
      setErrorMessage("Unsupported file format. Please upload an image (JPG, PNG, WEBP) or PDF.");
      setStatus("error");
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);

    // Create local object URL for instant UI preview
    if (selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }

    try {
      setStatus("compressing");
      const base64Data = await compressImage(selectedFile);

      setStatus("scanning");

      // 20s timeout safety guard
      let isTimedOut = false;
      const timeoutTimer = setTimeout(() => {
        isTimedOut = true;
      }, 20000);

      try {
        const result = await scanBillApi(base64Data);
        clearTimeout(timeoutTimer);

        if (isTimedOut) {
          throw new Error("Request timed out. The server took too long to respond.");
        }

        setExtractedData(result);
        setStatus("review");
      } catch (err) {
        clearTimeout(timeoutTimer);
        throw err;
      }
    } catch (err) {
      console.error("Scanner error:", err);
      setErrorMessage(err.message || "Failed to extract receipt data.");
      setStatus("error");
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const retryScan = () => {
    if (file) {
      processFile(file);
    } else {
      setStatus("idle");
    }
  };

  const updateField = (field, value) => {
    setExtractedData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      
      // Auto recalculate subtotal / tax sync if total changed
      if (field === "lineItems") {
        const newTotal = value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        if (newTotal > 0) {
          updated.total = Number(newTotal.toFixed(2));
        }
      }
      return updated;
    });
  };

  const addLineItem = () => {
    setExtractedData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lineItems: [
          ...prev.lineItems,
          { description: "New Item", quantity: 1, unitPrice: 0, amount: 0 },
        ],
      };
    });
  };

  const removeLineItem = (index) => {
    setExtractedData((prev) => {
      if (!prev) return prev;
      const filtered = prev.lineItems.filter((_, i) => i !== index);
      return { ...prev, lineItems: filtered };
    });
  };

  const updateLineItem = (index, key, value) => {
    setExtractedData((prev) => {
      if (!prev) return prev;
      const items = [...prev.lineItems];
      const item = { ...items[index], [key]: value };

      if (key === "quantity" || key === "unitPrice") {
        const q = Number(item.quantity) || 1;
        const p = Number(item.unitPrice) || 0;
        item.amount = Number((q * p).toFixed(2));
      }
      items[index] = item;

      const newTotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
      return {
        ...prev,
        lineItems: items,
        total: newTotal > 0 ? Number(newTotal.toFixed(2)) : prev.total,
      };
    });
  };

  const resetScanner = () => {
    setStatus("idle");
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setExtractedData(null);
    setErrorMessage(null);
  };

  return {
    status,
    file,
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
  };
};
