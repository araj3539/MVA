import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: String,       // Clerk userId
  doctorId: mongoose.Schema.Types.ObjectId,
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

export default mongoose.model("Appointment", appointmentSchema);
