const express = require("express");
const axios = require("axios");
const https = require("https");
const router = express.Router();

// Force IPv4 to prevent connection issues
const httpsAgent = new https.Agent({ family: 4 });

router.get("/token", async (req, res) => {
  try {
    // 1. Verify API Key
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.error("❌ ERROR: ASSEMBLYAI_API_KEY is missing in .env");
      return res.status(500).json({ error: "Server API Key missing" });
    }

    // 2. Request Token from EU Endpoint (Bypasses US Network Block)
    // We use the V3 endpoint which matches your key type.
    const response = await axios.get("https://streaming.eu.assemblyai.com/v3/token", {
      params: { expires_in_seconds: 600 }, // Max 600s for V3
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json"
      },
      httpsAgent: httpsAgent,
      timeout: 5000 // Fail fast after 5s
    });

    // 3. Send token to frontend
    res.json(response.data);

  } catch (error) {
    console.error("❌ Token Generation Failed:", error.message);
    if (error.response) {
      console.error("AssemblyAI Response:", error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;