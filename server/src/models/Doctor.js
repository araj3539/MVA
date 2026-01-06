const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  date: String,        // YYYY-MM-DD
  time: String,        // HH:mm
  isBooked: {
    type: Boolean,
    default: false
  }
});

const doctorSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  specialization: String,
  experience: Number,
  slots: [slotSchema]
});

// Use module.exports instead of export default
module.exports = mongoose.model("Doctor", doctorSchema);