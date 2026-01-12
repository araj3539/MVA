const { checkEmergency } = require("../services/safety.service");
const {
  generateAIResponse: generateResponse,
} = require("../services/ai.router");
const Conversation = require("../models/Conversation");
const Doctor = require("../models/Doctor");
const { generateDoctorCallResponse } = require("../services/ai.router");

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
    const lastMsg = await Conversation.findOne({ userId }).sort({
      timestamp: -1,
    });
    if (lastMsg && isEcho(cleanText, lastMsg.aiText)) {
      console.log("🚫 Echo detected.");
      return res.json({ aiText: "", ignored: true });
    }

    // --- 2. EMERGENCY CHECK ---
    if (checkEmergency(cleanText)) {
      const emergencyMsg =
        "🚨 This sounds like a medical emergency. Please hang up and call 911 immediately.";
      if (userId !== "guest") {
        if (aiText && aiText.trim()) {
  await Conversation.create({
    userId,
    userText: text,
    aiText,
    doctorId: doctorId || null,
  });
} else {
  console.warn("⚠️ Skipping save: empty aiText");
}

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

      const doctorSystemInstruction = `You are a real human doctor speaking on a phone call.

ROLE:
- Act like a calm, experienced doctor.
- Speak naturally, like a conversation, not a report.

RULES:
1. DO NOT repeat greetings if the call has already started.
2. DO NOT list many questions at once.
3. Ask at most ONE short follow-up question per response.
4. Do NOT use medical disclaimers or policy language.
5. Do NOT say “to proceed” or “please confirm”.
6. Avoid bullet points, lists, or long explanations.
7. Keep responses under 2–3 sentences unless absolutely necessary.

STYLE:
- Natural, empathetic, conversational.
- Short pauses implied, like real speech.

GOAL:
- Gradually understand symptoms.
- Give simple advice.
- Sound human.

You are already on the call. Continue naturally.
Do not restart the conversation. Continue from the current point.
`;

      const prompt = `
HISTORY:
${chatHistory}

PATIENT JUST SAID:
"${cleanText}"
`;

      aiText = await generateDoctorCallResponse(
        prompt,
        doctorSystemInstruction
      );

      if (userId !== "guest") {
        if (aiText && aiText.trim()) {
          await Conversation.create({
            userId,
            userText: text,
            aiText,
            doctorId: doctorId || null,
          });
        } else {
          console.warn("⚠️ Skipping save: empty aiText");
        }
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
You are the MVA Medical Assistant.
        - Analyze symptoms and provide brief guidance.
        - Recommend a doctor from the list if symptoms match.
        - Format: [REC:DOCTOR_ID] if recommending.
        - Keep it under 80 words.
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
        if (aiText && aiText.trim()) {
  await Conversation.create({
    userId,
    userText: text,
    aiText,
    doctorId: doctorId || null,
  });
} else {
  console.warn("⚠️ Skipping save: empty aiText");
}

      }
    }

    return res.json({ aiText, recommendedDoctor });
  } catch (err) {
    console.error("🔥 Controller Error:", err);
    return res.status(500).json({ error: "Processing failed" });
  }
};
