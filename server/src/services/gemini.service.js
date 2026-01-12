const geminiManager = require("../config/gemini");

// 🔒 Cooldown state (server-wide)
let lastGeminiCallTime = 0;
const GEMINI_COOLDOWN_MS = 4000;

// Helper function to wait
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.generateResponse = async (prompt, systemInstruction, retries = 5) => {
  try {
    // 4️⃣ Cooldown protection (IMPORTANT)
    const now = Date.now();
    if (now - lastGeminiCallTime < GEMINI_COOLDOWN_MS) {
      console.log("⏳ Gemini cooldown active. Skipping request.");
      return "Please give me a moment to think.";
    }

    // 1️⃣ Get client for current key
    const genAI = geminiManager.getClient();

    // 2️⃣ Use Gemini Flash 2.5
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    console.log("🤖 Gemini request sent");

    const result = await model.generateContent(prompt);

    // ✅ Update cooldown ONLY after success
    lastGeminiCallTime = Date.now();

    return result.response.text();

  } catch (error) {
    const status = error.status || error.response?.status;
    const isRateLimit = status === 429 || error.message?.includes("429");
    const isOverloaded = status === 503 || error.message?.includes("503");

    if ((isRateLimit || isOverloaded) && retries > 0) {
      console.warn(`⚠️ Gemini ${status}. Rotating key...`);
      geminiManager.rotateKey();
      await delay(500);
      return exports.generateResponse(prompt, systemInstruction, retries - 1);
    }

    console.error("🔥 Gemini API Error:", error);
    throw new Error("Failed to get response from AI");
  }
};
