const { checkEmergency } = require("../services/safety.service");
const { generateResponse } = require("../services/gemini.service");
const Conversation = require("../models/Conversation");
const Doctor = require("../models/Doctor");

// Track last processed text per user (simple debounce)
const lastUserTextMap = new Map();

/**
 * Helper to detect Echo (AI hearing itself)
 */
const isEcho = (userText, lastAiText) => {
  if (!userText || !lastAiText) return false;
  const cleanUser = userText.toLowerCase().trim();
  const cleanAi = lastAiText.toLowerCase().trim();
  return cleanAi.includes(cleanUser) || cleanUser.includes(cleanAi);
};

exports.handleText = async (req, res) => {
  try {
    const { text, isCallMode, doctorId } = req.body;
    const userId = req.auth ? req.auth.userId : "guest";

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text required" });
    }

    const cleanText = text.trim();

    // 2️⃣ FINAL TEXT ONLY (debounce duplicate text)
    if (lastUserTextMap.get(userId) === cleanText) {
      console.log("🚫 Duplicate text ignored");
      return res.json({ aiText: "", ignored: true });
    }
    lastUserTextMap.set(userId, cleanText);

    // --- 1. ECHO CANCELLATION ---
    const lastMsg = await Conversation.findOne({ userId }).sort({ timestamp: -1 });
    if (lastMsg && isEcho(cleanText, lastMsg.aiText)) {
      console.log("🚫 Echo detected.");
      return res.json({ aiText: "", ignored: true });
    }

    // --- 2. EMERGENCY CHECK ---
    if (checkEmergency(cleanText)) {
      const emergencyMsg =
        "🚨 This sounds like a medical emergency. Please hang up and call 911 immediately.";
      if (userId !== "guest") {
        await Conversation.create({
          userId,
          userText: cleanText,
          aiText: emergencyMsg,
          escalated: true,
          doctorId: doctorId || null,
        });
      }
      return res.json({ aiText: emergencyMsg, escalate: true });
    }

    let aiText = "";
    let recommendedDoctor = null;

    // ============================================================
    // MODE A: LIVE DOCTOR CALL
    // ============================================================
    if (isCallMode) {
      const doctorProfile = await Doctor.findById(doctorId);
      const doctorName = doctorProfile ? doctorProfile.name : "Dr. AI";
      const specialization = doctorProfile
        ? doctorProfile.specialization
        : "General Physician";

      const historyDocs = await Conversation.find({ userId, doctorId })
        .sort({ timestamp: -1 })
        .limit(6)
        .lean();

      const chatHistory = historyDocs
        .reverse()
        .map((h) => `Patient: "${h.userText}"\nDoctor: "${h.aiText}"`)
        .join("\n");

      const doctorSystemInstruction = `
You are ${doctorName}, a senior ${specialization} with 20 years of experience.
Act like a real doctor. Be decisive, short, and confident.
`;

      const prompt = `
HISTORY:
${chatHistory}

PATIENT JUST SAID:
"${cleanText}"
`;

      aiText = await generateResponse(prompt, doctorSystemInstruction);

      if (userId !== "guest") {
        await Conversation.create({ userId, userText: cleanText, aiText, doctorId });
      }

    // ============================================================
    // MODE B: GENERAL ASSISTANT
    // ============================================================
    } else {
      const historyDocs = await Conversation.find({ userId, doctorId: null })
        .sort({ timestamp: -1 })
        .limit(4)
        .lean();

      const historyText = historyDocs
        .reverse()
        .map((h) => `User: ${h.userText}\nAI: ${h.aiText}`)
        .join("\n");

      const doctors = await Doctor.find({}, "name specialization").lean();
      const doctorList = doctors
        .map((d) => `- Dr. ${d.name} (${d.specialization}) [ID: ${d._id}]`)
        .join("\n");

      const assistantSystemInstruction = `
You are a medical assistant.
Explain briefly and recommend a specialist.
Keep under 40 words.
`;

      const prompt = `
HISTORY:
${historyText}

DOCTORS AVAILABLE:
${doctorList}

USER SAID:
"${cleanText}"
`;

      aiText = await generateResponse(prompt, assistantSystemInstruction);

      const recMatch = aiText.match(/\[REC:([a-zA-Z0-9_]+)\]/);
      if (recMatch && recMatch[1]) {
        recommendedDoctor = await Doctor.findById(recMatch[1]);
        aiText = aiText.replace(/\[REC:[a-zA-Z0-9_]+\]/, "").trim();
      }

      if (userId !== "guest") {
        await Conversation.create({
          userId,
          userText: cleanText,
          aiText,
          escalated: !!recommendedDoctor,
          doctorId: null,
        });
      }
    }

    return res.json({ aiText, recommendedDoctor });

  } catch (err) {
    console.error("🔥 Controller Error:", err);
    return res.status(500).json({ error: "Processing failed" });
  }
};
