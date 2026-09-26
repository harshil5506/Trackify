import API from "../api/axios";

/**
 * Calls backend voice parser endpoint to convert raw speech transcript into structured expense fields
 * @param {string} transcript 
 * @param {string} currentDate 
 * @returns {Promise<Object>}
 */
export const parseVoiceTranscriptApi = async (transcript, currentDate = new Date().toISOString()) => {
  try {
    const response = await API.post("/api/voice/parse-transcript", {
      transcript,
      currentDate,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to parse voice transcript.";
    throw new Error(message);
  }
};
