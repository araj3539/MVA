const express = require("express");
const cors = require("cors");

// Import the routes
const voiceRoutes = require("./routes/voice.routes");
const appointmentRoutes = require("./routes/appointment.routes"); // Add this
const doctorRoutes = require("./routes/doctor.routes");         // Add this
// const authRoutes = require("./routes/auth.routes");          // Uncomment if you use auth routes

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Mount the routes
app.use("/api/voice", voiceRoutes);
app.use("/api/appointments", appointmentRoutes); // Add this
app.use("/api/doctors", doctorRoutes);           // Add this
// app.use("/api/auth", authRoutes);             // Uncomment if using auth

module.exports = app;