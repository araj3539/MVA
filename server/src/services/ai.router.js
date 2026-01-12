const { generateResponse: gemini } = require("./gemini.service");
const { generateWithPuter } = require("./puter.service");

// DEFAULT (assistant mode)
exports.generateAIResponse = async (prompt, systemInstruction) => {
  try {
    return await gemini(prompt, systemInstruction, 1, false);
  } catch {
    console.warn("⚠️ Gemini failed, switching to Puter");
  }
   try {
    const res = await generateWithPuter(prompt, systemInstruction);
    if (res && res.trim()) return res;
  } catch (err) {
    console.error("🔥 Puter failed", err);
  }

  // 🔐 FINAL GUARANTEE
  return "I'm having trouble responding right now. Could you repeat that?";
};

// 🔥 NEW: LIVE DOCTOR CALL (NO GEMINI)
exports.generateDoctorCallResponse = async (prompt, systemInstruction) => {
  // Always use Puter (or whichever you prefer)
   try {
    const res = await generateWithPuter(prompt, systemInstruction);
    if (res && res.trim()) return res;
  } catch (err) {
    console.error("🔥 Puter failed", err);
  }

  // 🔐 FINAL GUARANTEE
  return "I'm having trouble responding right now. Could you repeat that?";
};
