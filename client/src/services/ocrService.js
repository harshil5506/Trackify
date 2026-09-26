import API from "../api/axios";

/**
 * Sends compressed base64 receipt image to backend OCR proxy endpoint
 * @param {string} base64Image - Compressed Base64 image string
 * @returns {Promise<Object>} Normalized receipt data object
 */
export const scanBillApi = async (base64Image) => {
  try {
    const response = await API.post("/api/ocr/scan-bill", {
      image: base64Image,
    });
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "Failed to scan receipt image.";
    throw new Error(errorMsg);
  }
};
