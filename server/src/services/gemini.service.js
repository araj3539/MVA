const genAI = require("../config/gemini");

/**
 * Generic Gemini wrapper that accepts a prompt and a system instruction (persona).
 * @param {string} prompt - The user's input combined with context/history.
 * @param {string} systemInstruction - The "persona" (e.g., "You are a doctor..." or "You are an assistant...").
 */
exports.generateResponse = async (prompt, systemInstruction) => {
  try {
    // Use 'gemini-1.5-flash' for speed and high rate limits, or 'gemini-1.5-pro' for complex reasoning
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from AI");
  }
};