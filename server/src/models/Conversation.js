const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  doctorId: { type: String, default: null }, // Add this field
  userText: { type: String, required: true },
  aiText: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
  escalated: { type: Boolean, default: false },
});

module.exports = mongoose.model("Conversation", ConversationSchema);