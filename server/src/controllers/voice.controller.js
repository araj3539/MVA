const { checkEmergency } = require("../services/safety.service");
const { getGeminiResponse } = require("../services/gemini.service");
const Conversation = require("../models/Conversation");

exports.handleText = async (req, res) => {
  try {
    console.log("📩 Incoming body:", req.body);

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text required" });
    }

    if (checkEmergency(text)) {
      const emergencyMsg =
        "🚨 This may be a medical emergency. Please seek immediate medical attention.";

      await Conversation.create({
        userText: text,
        aiText: emergencyMsg,
        escalated: true
      });

      return res.json({
        aiText: emergencyMsg,
        escalate: true
      });
    }

    const aiText = await getGeminiResponse(text);

    const escalate =
      aiText.toLowerCase().includes("doctor") ||
      aiText.toLowerCase().includes("consult");

    await Conversation.create({
      userText: text,
      aiText,
      escalated: escalate
    });

    res.json({ aiText, escalate });

  } catch (err) {
    console.error("🔥 Voice Controller Error:", err);
    res.status(500).json({ error: "AI processing failed" });
  }
};
