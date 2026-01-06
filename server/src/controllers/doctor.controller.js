const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

exports.addSlot = async (req, res) => {
  try {
    const { clerkUserId, date, time } = req.body;
    const doctor = await Doctor.findOne({ clerkUserId });

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    doctor.slots.push({ date, time });
    await doctor.save();

    res.json({ message: "Slot added successfully" });
  } catch (err) {
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