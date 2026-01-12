const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

exports.addSlot = async (req, res) => {
  try {
    const { date, time } = req.body;
    
    // ✅ SECURE: Get ID from the authenticated token, not the body
    const clerkUserId = req.auth.userId; 

    const doctor = await Doctor.findOne({ clerkUserId });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found. Please contact admin." });
    }

    // Check for duplicates
    const exists = doctor.slots.some(s => s.date === date && s.time === time);
    if (exists) {
      return res.status(400).json({ error: "Slot already exists" });
    }

    doctor.slots.push({ date, time });
    await doctor.save();

    res.json({ message: "Slot added successfully" });
  } catch (err) {
    console.error("Add Slot Error:", err);
    res.status(500).json({ error: "Error adding slot" });
  }
};

exports.getMySlots = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor.slots);
  } catch (err) {
    res.status(500).json({ error: "Error fetching slots" });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Error fetching appointments" });
  }
};