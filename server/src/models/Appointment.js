const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientId: String,       // Clerk userId (String)
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
  },
  date: String,
  time: String,
  status: {
    type: String,
    enum: ["booked", "cancelled", "completed"],
    default: "booked"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);