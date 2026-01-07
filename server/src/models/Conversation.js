const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String, // Clerk User ID
    required: true,
    index: true
  },
  userText: String,
  aiText: String,
  escalated: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Conversation", conversationSchema);