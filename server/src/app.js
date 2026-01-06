const express = require("express");
const cors = require("cors");

// Import Routes
const voiceRoutes = require("./routes/voice.routes");
const assemblyRoutes = require("./routes/assembly.routes"); // <--- Import this
// Ensure these exist if you are using them, otherwise comment them out:
const appointmentRoutes = require("./routes/appointment.routes");
const doctorRoutes = require("./routes/doctor.routes");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Mount Routes
app.use("/api/voice", voiceRoutes);
app.use("/api/assembly", assemblyRoutes); // <--- Mount this
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);

module.exports = app;