const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  userText: String,
  aiText: String,
  escalated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Conversation", conversationSchema);
