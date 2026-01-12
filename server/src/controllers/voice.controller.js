const { checkEmergency } = require("../services/safety.service");
const { generateResponse } = require("../services/gemini.service");
const Conversation = require("../models/Conversation");
const Doctor = require("../models/Doctor");

/**
 * Helper to detect if the user input is just the AI hearing itself (Echo).
 * This prevents the infinite loop of "repeating" words.
 */
const isEcho = (userText, lastAiText) => {
  if (!userText || !lastAiText) return false;
  const cleanUser = userText.toLowerCase().trim();
  const cleanAi = lastAiText.toLowerCase().trim();
  
  // Check if the user text is a subset of what the AI just said
  // (e.g., AI said "Hello there", Mic picked up "there")
  return cleanAi.includes(cleanUser) || cleanUser.includes(cleanAi);
};

exports.handleText = async (req, res) => {
  try {
    const { text, isCallMode, doctorId } = req.body;
    const userId = req.auth ? req.auth.userId : "guest"; 

    if (!text) return res.status(400).json({ error: "Text required" });

    // --- 1. ECHO CANCELLATION ---
    // Fetch the very last message (regardless of doctor) to check for immediate audio feedback
    const lastMsg = await Conversation.findOne({ userId }).sort({ timestamp: -1 });
    
    if (lastMsg && isEcho(text, lastMsg.aiText)) {
      console.log("🚫 Echo detected. Ignoring input to prevent loop.");
      return res.json({ aiText: "", ignored: true }); 
    }

    // --- 2. EMERGENCY CHECK ---
    if (checkEmergency(text)) {
      const emergencyMsg = "🚨 This sounds like a medical emergency. Please hang up and call 911 immediately.";
      if (userId !== "guest") {
        await Conversation.create({ userId, userText: text, aiText: emergencyMsg, escalated: true, doctorId: doctorId || null });
      }
      return res.json({ aiText: emergencyMsg, escalate: true });
    }

    let aiText = "";
    let recommendedDoctor = null;

    // ============================================================
    // MODE A: LIVE DOCTOR CALL (Specific Doctor Context)
    // ============================================================
    if (isCallMode) {
      
      // Fetch History ONLY for this specific doctor
      // This ensures we don't mix up context from other doctors
      const historyDocs = await Conversation.find({ userId, doctorId })
        .sort({ timestamp: -1 })
        .limit(10) // Limit to last 10 turns to save tokens
        .lean();

      // Transform into "Medical Snapshot" points (Token efficient)
      const medicalSnapshot = historyDocs.reverse().map(h => {
          return `- Pt: "${h.userText}" | Dr: "${h.aiText}"`; 
      }).join("\n");

      // Fetch Doctor Name for the persona
      const doctorProfile = await Doctor.findById(doctorId);
      const doctorName = doctorProfile ? doctorProfile.name : "Medical Specialist";

      const doctorSystemInstruction = `
        You are Dr. ${doctorName}, a professional and empathetic medical doctor.
        
        **STRICT RULES:**
        1. **NO REPETITION:** Do NOT introduce yourself again. You are already in a call.
        2. **BREVITY:** Keep responses SHORT (under 40 words) and conversational.
        3. **FORMAT:** Do not use lists or special characters. Speak like a human.
        4. **SAFETY:** If symptoms seem critical (chest pain, trouble breathing), mildly suggest ER.
        
        **PATIENT MEDICAL SNAPSHOT (Previous notes from THIS call):**
        ${medicalSnapshot || "No prior notes for this session."}
      `;

      const doctorPrompt = `
        **Patient just said:** "${text}"
        
        **Respond as Dr. ${doctorName}:**
      `;

      // Call Gemini with Doctor Persona
      aiText = await generateResponse(doctorPrompt, doctorSystemInstruction);

      // Save Log with doctorId
      if (userId !== "guest") {
        await Conversation.create({ userId, userText: text, aiText, doctorId });
      }

    // ============================================================
    // MODE B: GENERAL ASSISTANT (General Context)
    // ============================================================
    } else {
      
      // Fetch General History (Assistant Mode)
      const historyDocs = await Conversation.find({ userId, doctorId: null })
        .sort({ timestamp: -1 })
        .limit(5)
        .lean();

      const historyText = historyDocs.reverse()
        .map(h => `User: ${h.userText}\nAI: ${h.aiText}`)
        .join("\n");

      // Fetch Doctors for recommendation
      const doctors = await Doctor.find({}, "name specialization experience clerkUserId").lean();
      const doctorList = doctors.map(d => `- Dr. ${d.name} (${d.specialization}) [ID: ${d._id}]`).join("\n");

      const assistantSystemInstruction = `
        You are the MVA Medical Assistant.
        - Analyze symptoms and provide brief guidance.
        - Recommend a doctor from the list if symptoms match.
        - Format: [REC:DOCTOR_ID] if recommending.
        - Keep it under 80 words.
      `;

      const assistantPrompt = `
        ### HISTORY:
        ${historyText || "None"}

        ### DOCTORS:
        ${doctorList}

        ### USER INPUT:
        "${text}"
      `;

      // Call Gemini with Assistant Persona
      aiText = await generateResponse(assistantPrompt, assistantSystemInstruction);

      // Extract Recommendation
      const recMatch = aiText.match(/\[REC:([a-zA-Z0-9_]+)\]/);
      if (recMatch && recMatch[1]) {
        recommendedDoctor = await Doctor.findById(recMatch[1]);
        aiText = aiText.replace(/\[REC:[a-zA-Z0-9_]+\]/, "").trim();
      }

      // Save Log (No doctorId for assistant)
      if (userId !== "guest") {
        await Conversation.create({
          userId,
          userText: text,
          aiText,
          escalated: !!recommendedDoctor,
          doctorId: null
        });
      }
    }

    res.json({ aiText, recommendedDoctor });

  } catch (err) {
    console.error("🔥 Controller Error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
};