import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/token", async (req, res) => {
  const response = await fetch(
    "https://api.assemblyai.com/v2/realtime/token",
    {
      method: "POST",
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ expires_in: 3600 })
    }
  );

  const data = await response.json();
  res.json(data);
});

export default router;
