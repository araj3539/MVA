const { checkEmergency } = require("../services/safety.service");
const { getGeminiResponse } = require("../services/gemini.service");

exports.handleText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text required" });
    }

    // Emergency detection
    if (checkEmergency(text)) {
      return res.json({
        aiText:
          "This may be a medical emergency. Please seek immediate medical help or call emergency services."
      });
    }

    const aiText = await getGeminiResponse(text);
    res.json({ aiText });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
