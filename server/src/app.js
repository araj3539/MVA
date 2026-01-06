const express = require("express");
const cors = require("cors");

const voiceRoutes = require("./routes/voice.routes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.use("/api/voice", voiceRoutes);

module.exports = app;
