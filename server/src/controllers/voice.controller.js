const { checkEmergency } = require("../services/safety.service");
const { getGeminiResponse } = require("../services/gemini.service");
const Conversation = require("../models/Conversation");
const Doctor = require("../models/Doctor");

exports.handleText = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.auth ? req.auth.userId : "guest"; 

    if (!text) return res.status(400).json({ error: "Text required" });

    // 1. Safety Check
    if (checkEmergency(text)) {
      const emergencyMsg = "🚨 Medical emergency detected. Please call 911.";
      if (userId !== "guest") {
        await Conversation.create({ userId, userText: text, aiText: emergencyMsg, escalated: true });
      }
      return res.json({ aiText: emergencyMsg, escalate: true });
    }

    // 2. Fetch History
    const history = await Conversation.find({ userId }).sort({ timestamp: -1 }).limit(5).lean();
    const formattedHistory = history.reverse().map(h => `User: ${h.userText}\nAI: ${h.aiText}`).join("\n");

    // 3. Fetch Doctors (Include ID for the AI to reference)
    const doctors = await Doctor.find({}, "name specialization experience clerkUserId").lean();
    // Format: "Dr. Name (Spec, Exp) [ID: 123]"
    const doctorList = doctors.map(d => `- Dr. ${d.name} (${d.specialization}) [ID: ${d._id}]`).join("\n");

    // 4. Get AI Response
    let aiText = await getGeminiResponse(text, formattedHistory, doctorList);

    // 5. Extract Recommended Doctor ID (Regex: [REC:xyz])
    let recommendedDoctor = null;
    const recMatch = aiText.match(/\[REC:([a-zA-Z0-9_]+)\]/);
    
    if (recMatch && recMatch[1]) {
      const doctorId = recMatch[1];
      recommendedDoctor = await Doctor.findById(doctorId);
      
      // Remove the tag from the spoken text so the user doesn't hear/see "[REC:...]"
      aiText = aiText.replace(/\[REC:[a-zA-Z0-9_]+\]/, "").trim();
    }

    // 6. Save & Respond
    if (userId !== "guest") {
      await Conversation.create({
        userId,
        userText: text,
        aiText,
        escalated: !!recommendedDoctor
      });
    }

    // Send cleaned text AND the full doctor object
    res.json({ aiText, recommendedDoctor });

  } catch (err) {
    console.error("🔥 Voice Controller Error:", err);
    res.status(500).json({ error: "AI processing failed" });
  }
};