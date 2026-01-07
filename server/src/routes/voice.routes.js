const express = require("express");
const router = express.Router();
const { handleText } = require("../controllers/voice.controller");
const { requireAuth } = require("../middlewares/requireAuth"); // Ensure this exists

// POST /api/voice
// We use requireAuth to populate req.auth.userId
router.post("/", requireAuth, handleText);

module.exports = router;