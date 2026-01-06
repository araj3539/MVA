const express = require("express");
const { handleText } = require("../controllers/voice.controller");

const router = express.Router();
router.post("/", handleText);

module.exports = router;
